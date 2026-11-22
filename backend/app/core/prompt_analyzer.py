"""
Prompt Semantic and Complexity Analyzer

Performs arrival-time (t=0) lexical, structural, and semantic inspection
of the user prompt string prior to feature-vector assembly and model selection.
Operates strictly on pre-inference features with zero post-inference or target leakage.

Note: This is an explainable heuristic feature extraction module, not a trained
classifier. It infers task complexity, reasoning depth, task category, and subject
domain based on deterministic linguistic, mathematical, and programming syntax patterns
calibrated to the dataset taxonomy.
"""

import re
from typing import Dict, Any, List


class PromptAnalyzer:
    """Arrival-time heuristic analyzer that extracts query complexity, reasoning depth,

    task category, subject domain, and domain requirement flags with zero target leakage.
    """

    # Exactly 15 valid task categories from preprocessor_config.json
    VALID_CATEGORIES = [
        "Code Generation",
        "Code Review",
        "Comparative Analysis",
        "Conceptual Question",
        "Content Creation",
        "Data Analysis",
        "Debugging",
        "Documentation",
        "Explanation",
        "How-To Tutorial",
        "Optimization Task",
        "Problem Solving",
        "Research Assistance",
        "Summarization Task",
        "Translation Task",
    ]

    # Exactly 25 valid subject domains from preprocessor_config.json
    VALID_DOMAINS = [
        "Biology",
        "Business",
        "Chemistry",
        "Cloud Computing",
        "Creative Writing",
        "Cyber Security",
        "Data Science",
        "DevOps",
        "Economics",
        "Education",
        "Finance",
        "General Question Answering",
        "Legal",
        "Machine Learning",
        "Marketing",
        "Mathematics",
        "Medical",
        "Networking",
        "Physics",
        "Programming",
        "Research",
        "Software Engineering",
        "Summarization",
        "Translation",
        "Writing",
    ]

    # High-difficulty engineering & systems patterns
    EXPERT_HARD_PATTERNS = [
        r"\b(?:fault-tolerant|distributed|high-throughput|microservices|consensus|paxos|raft|idempotent|idempotency)\b",
        r"\b(?:circuit\s*breaker|zero\s*data\s*loss|disaster\s*recovery|concurrency|race\s*condition|deadlock|mutex|semaphore)\b",
        r"\b(?:sliding-window|rate-limiter|sharding|replication|load\s*balancer|dynamic\s*programming|shortest\s*path)\b",
        r"\b(?:compiler|abstract\s*syntax\s*tree|ast|bytecode|kernel|memory\s*leak|buffer\s*overflow|cryptographic|zero-knowledge)\b",
        r"\b(?:closed-form|eigenvalue|eigenvalues|eigenvector|eigenvectors|orthogonality|orthonormal|diagonaliz\w+)\b",
        r"\b(?:differential\s*equation|navier-stokes|fourier\s*transform|stochastic\s*calculus|markov\s*chain|topology)\b",
        r"\b(?:formal\s*proof|proof\s*by\s*contradiction|prove\s+that|induction\s*step|axiom|theorem\s*proving)\b",
    ]

    # Programming & software engineering syntax markers
    CODE_PATTERNS = [
        r"```",
        r"\b(?:def|class|interface|struct|impl|func)\s+[a-zA-Z_]\w*|\bfunction\s+[a-zA-Z_]\w*\s*\(",
        r"\b(?:import|from\s+[a-zA-Z_]\w*\s+import|require\(|include\s*<)",
        r"\b(?:return|async|await|const|let|var|public\s+static\s+void)\b",
        r"\b(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b.*\b(?:FROM|WHERE|JOIN|SET)\b",
        r"[{}\[\];]{3,}",
        r"\b(?:unit\s*test|pytest|jest|junit|test\s*case|mocking|tdd|assertion)\b",
        r"\b(?:refactor|debugging|debug|traceback|syntaxerror|nullpointer|segfault|profiling)\b",
        r"\b(?:code\s*review|pull\s*requests?|\bpr\b|code\s*smells?|idiomatic|codebase)\b",
        r"\b(?:python|javascript|typescript|c\+\+|rust|golang|docker|kubernetes|redis|postgresql)\b",
    ]

    # Mathematical & quantitative markers
    MATH_PATTERNS = [
        r"\\[a-zA-Z]+",  # LaTeX: \frac, \sum, \int, etc.
        r"\b(?:matrix|matrices|determinant|integral|derivative|calculus|algebra|polynomial|quadratic)\b",
        r"\b(?:theorem|lemma|corollary|proof|qed|equation|formula|solve\s+for|limits?|cosine|sine|vector)\b",
        r"[\+\-\*\/=\^><]{2,}",
    ]

    # Multi-step reasoning & deductive markers
    REASONING_PATTERNS = [
        r"\b(?:step-by-step|step\s*by\s*step)\b",
        r"\b(?:compare\s+and\s+contrast|trade-offs|tradeoffs|pros\s+and\s+cons|comparative\s+analysis)\b",
        r"\b(?:root\s*cause|causal|counterfactual|under\s+what\s+conditions|implications\s+of)\b",
        r"\b(?:first\s*principles|deduce|deductive|inductive|critique|synthesize|edge\s*cases)\b",
        r"\b(?:why\s+does|explain\s+the\s+mechanism|how\s+does.*work\s+internally)\b",
        r"\b(?:worst-case|time\s*complexity|space\s*complexity|big-o|o\(n\w*\))\b",
    ]

    # Simple factual / operational lookups
    SIMPLICITY_PATTERNS = [
        r"^(?:what|who|where|when)\s+is\s+(?:the\s+)?(?:capital|president|founder|author|currency|meaning|definition|name)\b",
        r"^(?:what|who|where|when)\s+(?:was|did)\b",
        r"\b(?:translate\s+(?:this|the\s+following)?\s+(?:to|into))\b",
        r"\b(?:fix\s+(?:the\s+)?spelling|correct\s+(?:the\s+)?typo|proofread\s+this)\b",
        r"\b(?:summarize\s+in\s+\d+\s+(?:words|sentences|bullet\s*points))\b",
        r"^(?:hello|hi|hey|good\s+(?:morning|afternoon|evening)|how\s+are\s+you)\b",
        r"\b(?:synonym\s+for|antonym\s+for|define\s+[a-zA-Z]+$)\b",
        r"\b(?:yes\s+or\s+no|true\s+or\s+false)\b",
    ]

    @classmethod
    def infer_task_category(cls, text: str, requires_code: bool, requires_math: bool) -> str:
        """Deterministically infers one of the 15 valid Task Categories using prioritized intent patterns."""
        # 1. Translation Task
        if re.search(r"\b(?:translate\s+(?:this|the\s+following)?|translation\s+of|convert\s+(?:this\s+text\s+)?to\s+(?:spanish|french|german|mandarin|chinese|japanese|russian|italian|portuguese|arabic|hindi|english))\b", text, re.IGNORECASE):
            return "Translation Task"

        # 2. Summarization Task
        if re.search(r"\b(?:summarize|summary\s+of|tldr|condense|synthesize\s+(?:this|the\s+following)?\s+into|executive\s+summary|brief\s+summary|abstract\s+of|key\s+takeaways)\b", text, re.IGNORECASE):
            return "Summarization Task"

        # 3. Code Review
        if re.search(r"\b(?:code\s*review|review\s+(?:this|my)?\s*(?:code|implementation|pull\s*request|pr|diff)|critique\s+(?:this|the)?\s*code|audit\s+(?:this\s+)?code|check\s+for\s+code\s*smells|is\s+this\s+code\s+idiomatic|improve\s+code\s+quality)\b", text, re.IGNORECASE):
            return "Code Review"

        # 4. Debugging
        if re.search(r"\b(?:debug|fix\s+(?:the\s+)?(?:bug|error|issue|problem|crash|exception|typo|failing)|traceback|syntaxerror|typeerror|referenceerror|nullpointer|segfault|undefined\s+is\s+not|stack\s*overflow|why\s+is\s+(?:this\s+)?(?:code\s+)?failing|troubleshoot)\b", text, re.IGNORECASE):
            return "Debugging"

        # 5. Optimization Task
        if re.search(r"\b(?:optimize|performance\s*tuning|reduce\s+latency|speed\s*up|make\s+(?:it|this)\s+faster|profiling|time\s*complexity|space\s*complexity|improve\s+(?:the\s+)?efficiency|reduce\s+(?:memory|cpu))\b", text, re.IGNORECASE):
            return "Optimization Task"

        # 6. Documentation
        if re.search(r"\b(?:documentation|docstrings?|write\s+(?:the\s+)?docs|readme(?:\.md)?|api\s*documentation|document\s+(?:this|the)?\s*code|changelog|release\s*notes|comment\s+(?:this|the)?\s*code)\b", text, re.IGNORECASE):
            return "Documentation"

        # 7. Data Analysis
        if re.search(r"\b(?:data\s*analysis|analyze\s+(?:the\s+|this\s+)?dataset|pandas\s+dataframe|dataframe|descriptive\s+statistics|aggregations?|correlation\s+matrix|visualize\s+data|scatter\s*plot|histogram|exploratory\s+data\s+analysis|eda)\b", text, re.IGNORECASE):
            return "Data Analysis"

        # 8. Comparative Analysis
        if re.search(r"\b(?:compare\s+and\s+contrast|compare\s+[a-zA-Z0-9_\-]+\s+(?:and|with|to)\s+[a-zA-Z0-9_\-]+|\bvs\.?\b|versus|trade-offs?|pros\s+and\s+cons|difference\s+between|which\s+(?:is|one\s+is)\s+better)\b", text, re.IGNORECASE):
            return "Comparative Analysis"

        # 9. Research Assistance
        if re.search(r"\b(?:literature\s*review|research\s*papers?|citations?|state\s+of\s+the\s+art|academic\s+(?:sources|literature|synthesis)|recent\s+advances\s+in|survey\s+paper|systematic\s+review)\b", text, re.IGNORECASE):
            return "Research Assistance"

        # 10. How-To Tutorial
        if re.search(r"\b(?:how\s+(?:do\s+i|can\s+i|to)|step-by-step\s+(?:guide|tutorial|instructions)|walkthrough|tutorial\s+on|guide\s+(?:on|to)|instructions\s+to\s+(?:install|setup|configure|deploy|build))\b", text, re.IGNORECASE):
            return "How-To Tutorial"

        # 11. Content Creation
        if re.search(r"\b(?:write\s+an?\s+(?:essay|blog\s*post|article|email|story|poem|press\s*release|speech|marketing\s*copy|cover\s*letter|script|newsletter)|compose\s+a\s+(?:song|poem|story)|draft\s+an?\s+(?:email|announcement))\b", text, re.IGNORECASE):
            return "Content Creation"

        # 12. Problem Solving
        if requires_math or re.search(r"\b(?:solve\s+for|find\s+the\s+(?:maximum|minimum|optimal|value)|algorithm\s+for|puzzle|dynamic\s*programming|shortest\s*path|graph\s*traversal|derive\s+the\s+formula|evaluate\s+the\s+expression|calculate\s+the)\b", text, re.IGNORECASE):
            return "Problem Solving"

        # 13. Explanation
        if re.search(r"\b(?:explain\b|walk\s+me\s+through|how\s+does.*work|break\s+down\b|clarify\b)", text, re.IGNORECASE):
            return "Explanation"

        # 14. Code Generation
        if re.search(r"\b(?:write|create|implement|build|develop|generate|code)\s+(?:a\s+|an\s+)?(?:python|javascript|typescript|c\+\+|rust|golang|sql|bash|html|css|react)?\s*(?:function|script|class|module|program|endpoint|api|algorithm|component|service|app)\b", text, re.IGNORECASE) or (requires_code and re.search(r"\b(?:write|create|implement|build|develop|generate|code|program)\b", text, re.IGNORECASE)):
            return "Code Generation"

        # 15. Default: Conceptual Question
        return "Conceptual Question"

    @classmethod
    def infer_subject_domain(cls, text: str, category: str, requires_code: bool, requires_math: bool) -> str:
        """Deterministically infers one of the 25 valid Subject Domains using specialized keyword scoring."""
        scores: Dict[str, int] = {domain: 0 for domain in cls.VALID_DOMAINS}

        # 1. Specialized domains with high-precision terms
        domain_patterns = {
            "Machine Learning": [
                r"\b(?:machine\s*learning|deep\s*learning|neural\s*networks?|transformers?|llms?|language\s*models?)\b",
                r"\b(?:loss\s*function|backpropagation|gradient\s*descent|pytorch|tensorflow|fine-tuning|embeddings|attention\s*mechanism|hyperparameters?)\b",
            ],
            "Data Science": [
                r"\b(?:pandas|numpy|scikit-learn|eda|regression|clustering|feature\s*engineering|seaborn|matplotlib|outlier|data\s*cleaning|random\s*forest|data\s*science)\b",
            ],
            "DevOps": [
                r"\b(?:docker|kubernetes|k8s|helm|ci\/cd|pipelines?|terraform|ansible|github\s*actions|gitlab\s*ci|prometheus|grafana|containerization|deployment|deploying)\b",
            ],
            "Cloud Computing": [
                r"\b(?:aws|azure|gcp|serverless|s3|ec2|lambda|vpc|cloud\s*infrastructure|cloudformation|blob\s*storage|cloud\s*computing)\b",
            ],
            "Cyber Security": [
                r"\b(?:vulnerability|vulnerabilities|cve|cryptography|firewall|oauth|jwt|encryption|authentication|auth|penetration\s*testing|pentest|exploit|malware|ransomware|zero-day|owasp|injection|cyber\s*security)\b",
            ],
            "Software Engineering": [
                r"\b(?:microservices|software\s*architecture|design\s*patterns?|distributed(?:\s*(?:systems?|database|storage|computing|ledger))?|consensus|paxos|raft|scalability|system\s*design|fault-tolerant|rate-limiter|high-throughput|concurrency|solid\s*principles|modularity|software\s*engineering)\b",
                r"\b(?:code\s*review|pull\s*requests?|\bpr\b|code\s*smells?|refactor(?:ing)?|codebase|clean\s*code|version\s*control|git\b|github|gitlab|software\s*development)\b",
            ],
            "Networking": [
                r"\b(?:tcp\/ip|udp|dns|http|https|websockets?|subnet|cidr|ip\s*address|network\s*partitions?|routing\s*protocol|osi\s*model|packets?|sockets?|networking|ports?)\b",
            ],
            "Mathematics": [
                r"\b(?:calculus|matrix|matrices|eigenvalue|eigenvalues|eigenvector|eigenvectors|integral|integrals|algebra|theorem|lemma|proof|probability|discrete\s*math|derivative|polynomial|orthogonality|determinant)\b",
            ],
            "Physics": [
                r"\b(?:quantum|thermodynamics|relativity|electromagnetism|mechanics|particle|gravity|velocity|acceleration|photon|optics|navier-stokes|schrodinger|wave\s*function|physics)\b",
            ],
            "Medical": [
                r"\b(?:clinical|diagnosis|pathology|pharmacology|symptom|symptoms|therapy|disease|dosage|hospital|patient|physician|medicine|treatment\s*guidelines?|cardiology|oncology|neurology|pediatric|medical)\b",
            ],
            "Legal": [
                r"\b(?:contract|contracts|compliance|gdpr|intellectual\s*property|patent|patents|litigation|liability|jurisdiction|statute|statutory|lawyer|legal|nda|trademark|copyright)\b",
            ],
            "Finance": [
                r"\b(?:portfolio|valuation|dcf|stocks?|dividend|balance\s*sheet|crypto|cryptocurrency|blockchain|hedge\s*fund|market\s*cap|banking|options\s*trading|asset\s*allocation|financial\s*statements?|finance)\b",
            ],
            "Economics": [
                r"\b(?:inflation|gdp|monetary\s*policy|fiscal\s*policy|supply\s*and\s*demand|macroeconomics|microeconomics|recession|central\s*bank|interest\s*rates?|deflation|economics)\b",
            ],
            "Biology": [
                r"\b(?:dna|rna|crispr|gene|genes|genome|cellular|enzyme|protein\s*synthesis|organism|ecology|bacteria|virus|mutation|species|biological|biology)\b",
            ],
            "Chemistry": [
                r"\b(?:molecule|molecules|atom|atoms|reaction|organic\s*chemistry|periodic\s*table|covalent|stoichiometry|acid|base|catalyst|compound|chemical|chemistry)\b",
            ],
            "Business": [
                r"\b(?:kpi|roi|enterprise|corporate|stakeholders?|b2b|b2c|business\s*model|revenue|startup|startups|mergers?|acquisitions?|business\s*strategy|business)\b",
            ],
            "Marketing": [
                r"\b(?:seo|conversion\s*rates?|branding|lead\s*generation|campaigns?|funnels?|click-through|ctr|social\s*media\s*marketing|marketing)\b",
            ],
            "Education": [
                r"\b(?:curriculum|pedagogy|syllabus|lesson\s*plans?|rubrics?|tutoring|classrooms?|student\s*assessment|education)\b",
            ],
            "Creative Writing": [
                r"\b(?:character\s*arcs?|novels?|fiction|poetry|screenplays?|protagonists?|narratives?|creative\s*writing|stories)\b",
            ],
            "Research": [
                r"\b(?:methodology|hypotheses|hypothesis|literature\s*survey|empirical\s*study|peer-reviewed|academic\s*research|research\s*method)\b",
            ],
            "Writing": [
                r"\b(?:grammar|proofread|copyedit|sentence\s*structure|prose\s*style|writing\s*style|drafting)\b",
            ],
            "Programming": [
                r"\b(?:python|javascript|typescript|c\+\+|rust|golang|sql|functions?|arrays?|syntax|loops?|def\s+[a-zA-Z]|class\s+[a-zA-Z]|unit\s*tests?|programming|coding|algorithms?|sorting|data\s*structures?|modules?|docstrings?)\b",
                r"\b(?:idiomatic|code\s*snippets?|boilerplate|variables?|recursion)\b",
            ],
        }

        for domain_name, patterns in domain_patterns.items():
            for p in patterns:
                matches = len(re.findall(p, text, re.IGNORECASE))
                if matches > 0:
                    scores[domain_name] += matches * 2

        # Contextual domain affinities based on category
        if category == "Translation Task":
            scores["Translation"] += 4
        elif category == "Summarization Task" and max(scores.values()) == 0:
            scores["Summarization"] += 4
        elif category == "Code Review" and scores["Software Engineering"] == 0 and scores["Programming"] == 0:
            scores["Software Engineering"] += 4
        elif category in ["Code Generation", "Debugging"] and scores["Programming"] == 0 and scores["Software Engineering"] == 0:
            scores["Programming"] += 4
        elif category == "Documentation" and requires_code and scores["Programming"] == 0:
            scores["Programming"] += 4

        if requires_code and scores["Programming"] == 0 and scores["Software Engineering"] == 0 and scores["DevOps"] == 0:
            scores["Programming"] += 2
        if requires_math and scores["Mathematics"] == 0:
            scores["Mathematics"] += 2

        # Select highest scoring domain
        best_domain = max(scores, key=lambda k: scores[k])
        if scores[best_domain] > 0:
            return best_domain

        return "General Question Answering"

    @classmethod
    def analyze(cls, query: str) -> Dict[str, Any]:
        """Analyzes query text at arrival time and returns detected task category,

        subject domain, complexity, reasoning depth, requirement flags, and explainable signals.
        """
        text = (query or "").strip()
        words = text.split()
        word_count = len(words)
        char_count = len(text)
        token_estimate = max(10, int(word_count * 1.33))

        signals: List[str] = []

        # Count pattern activations
        expert_matches = sum(1 for p in cls.EXPERT_HARD_PATTERNS if re.search(p, text, re.IGNORECASE))
        code_matches = sum(1 for p in cls.CODE_PATTERNS if re.search(p, text, re.IGNORECASE))
        math_matches = sum(1 for p in cls.MATH_PATTERNS if re.search(p, text, re.IGNORECASE))
        reasoning_matches = sum(1 for p in cls.REASONING_PATTERNS if re.search(p, text, re.IGNORECASE))
        simplicity_matches = sum(1 for p in cls.SIMPLICITY_PATTERNS if re.search(p, text, re.IGNORECASE))

        requires_code = code_matches >= 1
        requires_math = math_matches >= 1
        requires_reasoning = reasoning_matches >= 1 or expert_matches >= 1 or math_matches >= 2

        # 1. Infer Category & Domain
        category = cls.infer_task_category(text, requires_code, requires_math)
        domain = cls.infer_subject_domain(text, category, requires_code, requires_math)

        signals.append(f"Inferred task intent '{category}' in domain '{domain}'")

        if expert_matches > 0:
            signals.append(f"High-complexity systems or theoretical markers ({expert_matches} pattern matches)")
        if code_matches > 0:
            signals.append(f"Programming syntax or software engineering markers ({code_matches} pattern matches)")
        if math_matches > 0:
            signals.append(f"Mathematical/symbolic structures detected ({math_matches} pattern matches)")
        if reasoning_matches > 0:
            signals.append(f"Multi-step deduction or comparative reasoning cues ({reasoning_matches} pattern matches)")
        if simplicity_matches > 0:
            signals.append("Factual lookup / template retrieval pattern detected")

        # Structural cues
        has_numbered_list = bool(re.search(r"(?:^|\n)\s*(?:\d+\.|\-|\*)\s+", text))
        if has_numbered_list:
            signals.append("Multi-item structured list / specifications detected")

        # Deterministic Complexity & Reasoning Assignment
        if simplicity_matches >= 1 and expert_matches == 0 and code_matches == 0 and math_matches == 0 and word_count <= 25:
            complexity = "Easy"
            reasoning_level = "Low"
            signals.append(f"Concise factual inquiry ({word_count} words)")
        elif expert_matches >= 2 or (expert_matches >= 1 and (token_estimate >= 150 or reasoning_matches >= 2)):
            if token_estimate >= 350 or expert_matches >= 3 or (expert_matches >= 2 and reasoning_matches >= 2):
                complexity = "Expert"
                reasoning_level = "High"
                signals.append("Architecture-level multi-domain specifications and deep system constraints")
            else:
                complexity = "Hard"
                reasoning_level = "High"
                signals.append("Complex algorithmic/systems engineering problem decomposition")
        elif expert_matches >= 1 or (code_matches >= 2 and word_count >= 15) or (math_matches >= 2 and word_count >= 12) or (reasoning_matches >= 1 and word_count >= 20):
            complexity = "Hard"
            reasoning_level = "High"
            signals.append("Specialized domain problem solving requiring rigorous deduction")
        elif requires_code or requires_math or requires_reasoning or token_estimate >= 70:
            complexity = "Medium"
            reasoning_level = "Medium"
            signals.append("Moderate task scope requiring structured generation or domain context")
        elif token_estimate >= 250:
            complexity = "Hard"
            reasoning_level = "Medium"
            signals.append(f"Extended input context (~{token_estimate} tokens)")
        else:
            complexity = "Easy"
            reasoning_level = "Low"
            signals.append(f"Direct, low-overhead prompt (~{token_estimate} tokens)")

        # Heuristic calibration score
        base_confidence = 0.85
        if expert_matches >= 1 or simplicity_matches >= 1:
            base_confidence = 0.92
        if complexity in ["Easy", "Expert"]:
            base_confidence = min(0.96, base_confidence + 0.04)

        return {
            "category": category,
            "domain": domain,
            "complexity": complexity,
            "reasoning_level": reasoning_level,
            "requires_code": requires_code,
            "requires_math": requires_math,
            "requires_reasoning": requires_reasoning,
            "token_estimate": token_estimate,
            "char_count": char_count,
            "word_count": word_count,
            "signals": signals,
            "confidence": round(base_confidence, 2),
            "source": "automatic_detection",
        }


prompt_analyzer = PromptAnalyzer()
