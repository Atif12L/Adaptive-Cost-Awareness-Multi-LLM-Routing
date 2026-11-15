# Research Methodology & Integrity Audit
## An Adaptive Cost-Aware Semantic Routing Gateway for Multi-LLM Systems

---

### Executive Summary

This document provides a rigorous, transparent analysis of the research methodology, data pipeline, and empirical claims underlying the undergraduate thesis titled **"An Adaptive Cost-Aware Semantic Routing Gateway for Multi-LLM Systems"** (Department of Computer Science and Engineering, City University).

As part of transitioning this academic research into a production-grade, verifiable demonstration application, an extensive code and artifact audit was conducted. This audit cross-examined four primary artifacts:
1. **The Final Thesis Document:** `Adaptive_Cost-Aware_Semantic_Routing_Gateway_FINAL_THESIS.docx`
2. **The Pre-Defense Presentation:** `Adaptive_Cost_Aware_Semantic_Routing_Gateway Pre defence.pptx`
3. **The Experimental Jupyter Notebook:** `Adaptive_Cost_Aware_Semantic_Routing_Gateway.ipynb`
4. **The Benchmark Dataset:** `llm_routing_dataset.csv` (30,000 rows × 37 columns)

This document formalizes the historical reported results, details critical inconsistencies discovered across artifacts, and defines the **corrected, leakage-free methodology** implemented in this production system.

---

### 1. Historical Reported Research Findings

The original research manuscript and Colab notebook evaluate eight classical machine learning classifiers (Decision Tree, Random Forest, Extra Trees, Gradient Boosting, XGBoost, LightGBM, CatBoost, Logistic Regression) on the task of routing queries across five LLM families: **OpenAI GPT-4, Anthropic Claude, Google Gemini, Meta Llama, and DeepSeek**.

The benchmark reported the following headline metrics:

| Metric | Historical Reported Value | Context / Baseline |
| :--- | :--- | :--- |
| **Routing Accuracy (XGBoost)** | **97.70%** (0.9770 F1) | Multi-class classification across 5 candidate models |
| **5-Fold Cross-Validation F1** | **0.9743 ± 0.0011** | Stratified 5-fold CV on 24,000 training samples |
| **Operational Cost Reduction** | **53.34%** | Total cost: \$86.47 (Always-Large baseline) vs. \$40.35 (Router) |
| **Response Latency Reduction**| **41.84%** | Avg latency: 1,800.00 ms (Always-Large) vs. 1,046.82 ms (Router) |

These figures represent historical academic claims. In accordance with strict scientific integrity, **they are preserved as baseline reference points in the application and are never silently overwritten or fabricated.**

---

### 2. Comprehensive Research Integrity & Inconsistency Audit

During technical verification of the notebook code against the thesis text and presentation slides, several substantial discrepancies were identified:

#### Audit Item A: Semantic Embeddings (Slide Claims vs. Code Reality)
* **Presentation Claim (Slides 14–16, 23):** Claims that raw text queries undergo linguistic tokenization/lemmatization (NLTK/spaCy) and are mapped into 384-dimensional dense vectors using Hugging Face Transformer `sentence-transformers/all-MiniLM-L6-v2`, yielding 404 total features. Slide 23 lists *"Semantic Embedding Similarity"* as the #2 feature driving XGBoost decisions.
* **Thesis Concession (Section 3.6, Page 32):** The thesis explicitly acknowledges that **no dense text embeddings were computed**:
  > *"In the present implementation, the 'semantic' characterisation of each query is achieved indirectly, through structured metadata (task category, domain, complexity, and requirement flags), rather than through a dense vector embedding of the raw query text... computing a transformer-based sentence embedding for every incoming query would itself introduce non-trivial latency... Section 5.5 discusses the incorporation of semantic embeddings as a promising direction for future work."*
* **Notebook Reality (Cell 21):** The raw query text column `query` is completely discarded:
  ```python
  feature_df = df.drop(columns=["query_id", "query", TARGET_COL]).copy()
  ```
  No transformers, tokenizers, or dense vector spaces are generated. The total feature space after categorical one-hot encoding consists of **82 features**, not 404.

#### Audit Item B: Target & Post-Inference Data Leakage
* **The Issue:** In the experimental notebook (Cell 21), `feature_df` retained all columns from `llm_routing_dataset.csv` except `query_id`, `query`, and the target `recommended_model`.
* **Included Leaked Features:**
  1. `best_quality_model` (One-hot encoded into 5 separate binary columns)
  2. `lowest_cost_model` (One-hot encoded into binary columns)
  3. `lowest_latency_model` (One-hot encoded into binary columns)
  4. `routing_score` (Continuous composite multi-objective score)
  5. Per-model quality scores: `gpt_quality_score`, `claude_quality_score`, `gemini_quality_score`, `llama_quality_score`, `deepseek_quality_score`
  6. Per-model monetary costs: `gpt_cost`, `claude_cost`, `gemini_cost`, `llama_cost`, `deepseek_cost`
  7. Per-model latencies: `gpt_latency`, `claude_latency`, `gemini_latency`, `llama_latency`, `deepseek_latency`
* **Consequence:** In a real-world routing gateway, when a user prompt arrives, the gateway **cannot know** the quality score, latency, or actual cost of running that prompt across all 5 LLMs without executing them all upfront. Furthermore, `recommended_model` in the dataset matches `best_quality_model` in **85.11%** of all 30,000 queries.
* **Impact on Model:** XGBoost's #1 feature was `best_quality_model_Gemini`, with `best_quality_model_Claude` and other outcome flags dominating the decision tree splits. The 97.70% accuracy was primarily an artifact of learning the deterministic mapping from `best_quality_model` and `routing_score` to `recommended_model`.

#### Audit Item C: Cost Simulation Logic & Tier Mapping
* In the dataset, each sample contains explicit simulated cost values (`gpt_cost`, `claude_cost`, etc.).
* However, Notebook Cell 45 ignored these values and mapped the 5 model classes into 3 arbitrary pricing tiers:
  * Small: \$0.002 / 1K tokens
  * Medium: \$0.010 / 1K tokens
  * Large: \$0.030 / 1K tokens
* Because of an alphabetical sorting fallback in `map_to_tier`:
  `unique_sorted = sorted(['Claude', 'DeepSeek', 'GPT', 'Gemini', 'Llama'])`
  Claude (index 0) was mapped to "Small Model", and Llama (index 4) was mapped to "Large Model". In commercial reality, Llama is an open-weights/cost-efficient model, while Claude 3 Opus/Sonnet is a premium model.

#### Audit Item D: Latency Baseline Inconsistency
* **Presentation Slide 26:** Cites average response latency dropping from *~3.8s to ~2.2s*.
* **Notebook Cell 50 & DOCX Table 4.4:** Calculates the baseline as **1,800.00 ms (1.8s)** and the router average as **1,046.82 ms (~1.05s)**.

#### Audit Item E: Dataset Origin
* **Presentation Slide 13:** Describes the dataset as *"Multi-LLM query logs collected from GPT-4, Claude, Gemini, Llama, and DeepSeek"*.
* **Thesis Document (Section 3.3 & Section 5.4):** Transparently clarifies that the dataset is a **synthetically constructed benchmark** produced via structured prompt generation templates and scoring heuristics.

---

### 3. The Corrected, Leakage-Free Methodology

To deliver an academically honest, production-viable solution, this project implements a **two-tier architecture**:

```
                       ┌──────────────────────────────────────────────┐
                       │               Incoming Query                 │
                       └──────────────────────┬───────────────────────┘
                                              │
                     Features Strictly Available at Query Arrival Time:
                     • Text length & token count
                     • Task Category (Coding, Math, Reasoning, etc.)
                     • Subject Domain (Finance, Legal, Medical, etc.)
                     • Complexity & Reasoning Level (Easy to Expert)
                     • User Constraints (Urgency, Budget, Quality, Latency)
                     • Requirement Flags (requires_code, requires_math, etc.)
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
                      ▼                                               ▼
     ┌─────────────────────────────────┐             ┌─────────────────────────────────┐
     │   Historical Benchmark View     │             │    Corrected Leakage-Free ML    │
     │  (Preserved Original Research)  │             │   (Production Routing Engine)   │
     ├─────────────────────────────────┤             ├─────────────────────────────────┤
     │ • Historical Accuracy: 97.70%   │             │ • Trained without post-hoc data │
     │ • CV F1: 0.9743                 │             │ • 100% arrival-time features    │
     │ • Features: 82 (Includes leaks) │             │ • Validated on test split       │
     │ • Status: Preserved for audit   │             │ • Transparently reported        │
     └─────────────────────────────────┘             └────────────────┬────────────────┘
                                                                      │
                                                                      ▼
                                                     ┌─────────────────────────────────┐
                                                     │    Cost & Latency Simulation    │
                                                     │   (Documented Pricing Tables)   │
                                                     └────────────────┬────────────────┘
                                                                      │
                                                                      ▼
                                                     ┌─────────────────────────────────┐
                                                     │    Provider Adapter Engine      │
                                                     │  • Simulation Mode (Default)    │
                                                     │  • Real Provider APIs (Opt-In)  │
                                                     └─────────────────────────────────┘
```

#### Feature Classification Matrix:

| Feature Name in Dataset | Available at Arrival? | Historical Model | Corrected Model | Justification / Notes |
| :--- | :---: | :---: | :---: | :--- |
| `query` (text length / tokens) | **Yes** | Dropped | **Included** | Direct signal on prompt size & computational scope |
| `token_count` | **Yes** | Included | **Included** | Estimated token count of the incoming query |
| `context_length` | **Yes** | Included | **Included** | Size of historical context or prompt |
| `category` | **Yes** | Included | **Included** | Task category (15 categories, one-hot encoded) |
| `domain` | **Yes** | Included | **Included** | Subject domain (25 domains, one-hot encoded) |
| `complexity` | **Yes** | Included | **Included** | Ordinal encoded (Easy, Medium, Hard, Expert) |
| `reasoning_level` | **Yes** | Included | **Included** | Ordinal encoded (Low, Medium, High) |
| `urgency` | **Yes** | Included | **Included** | User priority configuration |
| `budget_priority` | **Yes** | Included | **Included** | User priority configuration |
| `quality_priority` | **Yes** | Included | **Included** | User priority configuration |
| `latency_priority` | **Yes** | Included | **Included** | User priority configuration |
| `requires_code` | **Yes** | Included | **Included** | Boolean requirement flag |
| `requires_math` | **Yes** | Included | **Included** | Boolean requirement flag |
| `requires_reasoning` | **Yes** | Included | **Included** | Boolean requirement flag |
| `requires_creativity` | **Yes** | Included | **Included** | Boolean requirement flag |
| `multilingual` | **Yes** | Included | **Included** | Boolean requirement flag |
| `best_quality_model` | **No** | Included | **EXCLUDED** | **Leakage:** Post-hoc comparison of model answers |
| `lowest_cost_model` | **No** | Included | **EXCLUDED** | **Leakage:** Post-hoc computation across models |
| `lowest_latency_model` | **No** | Included | **EXCLUDED** | **Leakage:** Post-hoc measurement across models |
| `routing_score` | **No** | Included | **EXCLUDED** | **Leakage:** Mathematical summary of targets |
| `*_quality_score` (5 cols) | **No** | Included | **EXCLUDED** | **Leakage:** Only known after evaluating outputs |
| `*_cost` (5 cols) | **No** | Included | **EXCLUDED** | **Leakage:** Exact execution cost post-invocation |
| `*_latency` (5 cols) | **No** | Included | **EXCLUDED** | **Leakage:** Measured network/inference latency |
| `recommended_model` | **Target** | Target | **Target** | Ground truth optimal model |

---

### 4. Implementation Standards

1. **Dual Metric Reporting:** The web interface clearly juxtaposes the **Historical Reported Research Results** alongside the **Validated Leakage-Free Implementation Results**.
2. **Simulation Mode by Default:** All cost savings and latency calculations use transparent, documented simulation parameters reflecting contemporary 2026 commercial API pricing.
3. **Pluggable Provider Architecture:** Real model execution is isolated in provider adapters (OpenAI, Anthropic, Gemini, Groq/Llama, DeepSeek) and requires explicit API keys, protecting users from unexpected charges.
4. **Reproducibility:** All training scripts, feature transformers, and evaluation code are packaged and runnable with a single command.
