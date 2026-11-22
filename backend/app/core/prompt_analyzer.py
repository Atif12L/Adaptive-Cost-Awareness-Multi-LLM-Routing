"""
Prompt Semantic and Complexity Analyzer

Performs arrival-time (t=0) lexical, structural, and semantic inspection
of the user prompt string prior to feature-vector assembly and model selection.
Operates strictly on pre-inference features with zero post-inference or target leakage.

Note: This is an explainable heuristic feature extraction module, not a trained
classifier. It infers task complexity and reasoning depth based on deterministic
linguistic, mathematical, and programming syntax patterns calibrated to the dataset taxonomy.
"""

import re
from typing import Dict, Any, List


class PromptAnalyzer:
    """Arrival-time heuristic analyzer that extracts query complexity,

    reasoning depth, and domain requirement flags with zero target leakage.
    """

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
        r"\b(?:def|class|interface|struct|impl|func|function)\s+[a-zA-Z_]\w*",
        r"\b(?:import|from\s+[a-zA-Z_]\w*\s+import|require\(|include\s*<)",
        r"\b(?:return|async|await|const|let|var|public\s+static\s+void)\b",
        r"\b(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b.*\b(?:FROM|WHERE|JOIN|SET)\b",
        r"[{}\[\];]{3,}",
        r"\b(?:unit\s*test|pytest|jest|junit|test\s*case|mocking|tdd|assertion)\b",
        r"\b(?:refactor|debugging|debug|traceback|syntaxerror|nullpointer|segfault|profiling)\b",
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
    def analyze(cls, query: str) -> Dict[str, Any]:
        """Analyzes query text at arrival time and returns detected complexity,

        reasoning depth, boolean requirement flags, and explainable signals.
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
