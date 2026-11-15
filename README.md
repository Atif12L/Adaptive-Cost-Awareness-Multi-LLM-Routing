# Adaptive Cost-Aware Semantic Routing Gateway for Multi-LLM Systems

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/ML%20Engine-XGBoost%20Native%20UBJ-orange)](https://xgboost.readthedocs.io/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, research-grounded web application and dynamic routing gateway for multi-LLM architectures. Built upon the City University undergraduate thesis: **"An Adaptive Cost-Aware Semantic Routing Gateway for Multi-LLM Systems"**.

- **GitHub Repository:** [Atif12L/Adaptive-Cost-Awareness-Multi-LLM-Routing](https://github.com/Atif12L/Adaptive-Cost-Awareness-Multi-LLM-Routing)
- **Supabase Cloud Project:** `https://tibnobwsfhrdpdbqdpux.supabase.co`

---

## 1. System Overview & Problem Statement

Modern enterprise AI systems routinely face severe trade-offs between generation quality, inference latency, and operational expense:
- **Over-provisioning:** Routing trivial queries (e.g., FAQ summaries, simple sentiment checks) to expensive frontier models ($10–$15 per million tokens) burns budgets unnecessarily.
- **Under-provisioning:** Routing nuanced legal, multi-step algorithmic, or mathematical reasoning tasks to lightweight 8B models leads to unacceptable hallucination rates.

The **Adaptive Cost-Aware Semantic Routing Gateway** solves this problem by inserting an intelligent, sub-millisecond machine learning routing layer in front of model providers. By extracting arrival-time query metadata (syntax, category, domain, complexity, user objectives), the gateway dynamically dispatches incoming queries to the most cost-effective LLM capable of satisfying the quality requirements.

---

## 2. Supported LLM Families

The system evaluates and routes across **five distinct LLM provider families**:

| LLM Family | Representative Tier | Input / M Tok | Output / M Tok | Typ. Latency | Primary Routing Triggers |
|---|---|---|---|---|---|
| **GPT** | GPT-4o / GPT-4o-mini | $2.50 | $10.00 | ~1,650 ms | High-complexity reasoning, JSON schemas, generalist STEM |
| **Claude** | Claude 3.5 Sonnet / Haiku | $3.00 | $15.00 | ~1,820 ms | Legal contract review, nuanced prose, strict zero-hallucination |
| **Gemini** | Gemini 1.5 Pro / Flash | $0.35 | $1.05 | ~620 ms | Large token contexts (up to 2M tokens), multimodal ingestion |
| **Llama** | Llama 3 8B / 70B (Groq) | $0.15 | $0.60 | ~450 ms | Sub-cent budget constraints, customer support, fast triage |
| **DeepSeek** | DeepSeek V3 / R1 Reasoner | $0.27 | $1.10 | ~980 ms | Competitive programming, math reasoning, algorithmic code |

*Pricing reflects calibrated 2026 commercial API tier rates.*

---

## 3. Two-Tier Architecture & Research Integrity

To uphold strict scientific integrity, this project explicitly separates **Historical Reported Thesis Research** from our **Independently Validated Leakage-Free System**:

```
+---------------------------------------------------------------------------------------------------+
|                                     RESEARCH VALIDATION AUDIT                                     |
+------------------------------------+--------------------------------+-----------------------------+
| Dimension                          | Historical Reported (Thesis)   | Validated Leakage-Free      |
+------------------------------------+--------------------------------+-----------------------------+
| XGBoost Classification Accuracy    | 97.70%                         | 58.62% (Test Set)           |
| 5-Fold Stratified Cross-Validation | Not reported                   | 57.36% ± 0.87%              |
| Macro Precision / Recall           | 97.65% / 97.68%                | 57.84% / 57.12%             |
| Simulated Cost Reduction           | 53.34%                         | 46.11% ($17.29 down to $9.32)|
| Simulated Latency Reduction        | 41.84%                         | 31.08% (1,650ms to 1,137ms) |
| Feature Set Count                  | 36 features (inc. leakages)    | 54 arrival-time attributes  |
| Post-Inference Leakage Exclusion   | Excluded: NO (Leakage present) | Excluded: YES (Zero leakage)|
+------------------------------------+--------------------------------+-----------------------------+
```

### Critical Findings & Discoveries

1. **Post-Hoc Data Leakage Identified:**
   - In the original training script (`Adaptive_Cost_Aware_Semantic_Routing_Gateway.ipynb`), input features included `best_quality_model`, `lowest_cost_model`, `lowest_latency_model`, and `routing_score`.
   - Inspection revealed that `best_quality_model` identically matched the target `recommended_model` in **85.11% of all rows**. The reported 97.70% accuracy was largely memorizing post-inference outcome columns.
   - **Our Resolution:** We built a dedicated `LeakageFreePreprocessor` strictly isolating 54 features known at query arrival time (character lengths, token estimates, code flags, domains, categories, objective weights). The resulting **58.62% accuracy** is nearly 3× random guessing (20% for 5 classes) and represents true out-of-sample generalization.

2. **Embeddings vs. Categorical Metadata:**
   - The pre-defense presentation referenced 384-dimensional sentence transformer embeddings (`all-MiniLM-L6-v2`), but Section 3.6 of the final thesis conceded that embeddings were omitted due to compute constraints.
   - We faithfully follow the **final thesis specification**, utilizing tabular metadata and syntactic feature extraction without falsely fabricating non-existent sentence vectors.

3. **Inference Latency Optimization:**
   - Pickled Scikit-Learn pipelines (`.joblib`) took 10–14 seconds to deserialize on Windows.
   - We converted the model to native **XGBoost Universal Binary JSON (`corrected_model.ubj`)** and decoupled the preprocessing into a lightweight configuration (`preprocessor_config.json`), achieving **0.10s startup** and **sub-millisecond (<1ms) inference times**.

---

## 4. Application Feature Tour

The web application provides eight dedicated pages:

- **1. Overview Dashboard (`/`):** High-level gateway health, model distribution, KPI cards, historical vs live performance counters.
- **2. Smart Query Routing Playground (`/playground`):** Interactive prompt input, category/domain selectors, objective tuning (cost, latency, quality, balanced), real-time recommendation, probability vector, and simulated model response.
- **3. Routing Analysis (`/analysis`):** In-depth decision rationale, feature attribution weights, Pareto efficiency trade-off scatter plot.
- **4. Model Profiles & Matrix (`/models`):** 5-family comparison, token pricing tables, context limits, architectural taxonomy, radar capability benchmarks.
- **5. System Analytics (`/analytics`):** 30,000-query aggregations, cumulative hourly spending curves, category-stratified cost reductions, complexity tiering.
- **6. Model Evaluation & Research Integrity (`/evaluation`):** Side-by-side audit matrix, 5×5 multiclass confusion matrix heatmap, arrival-time feature gain importance chart, 5-fold cross-validation logs.
- **7. Dataset Explorer (`/dataset`):** Interactive query browser with live search, pagination, multi-filter selectors, and complete 37-column feature taxonomy documentation.
- **8. System Settings (`/settings`):** Infrastructure health checks (FastAPI, XGBoost, Supabase), provider adapter statuses with zero credential exposure, simulation switches.

---

## 5. Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.4
- **Styling:** Tailwind CSS + Radix UI / shadcn design language
- **Visualizations:** Recharts (Scatter, Bar, Line, Area, Radar, Pie)
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI (ASGI)
- **Runtime:** Python 3.12+ / Uvicorn
- **ML Engine:** XGBoost 2.1 (Universal Binary JSON serialization), scikit-learn, NumPy, pandas
- **Database Client:** Async Supabase Client with graceful in-memory fallback
- **Provider Adapters:** OpenAI, Anthropic, Google Gemini, Groq (Llama), DeepSeek

### Database & Deployment
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Frontend Hosting:** Vercel Edge Network
- **Backend Hosting:** Render Web Service (containerized via `render.yaml`)

---

## 6. Directory Structure

```
Adaptive LLM/
├── backend/                        # FastAPI Backend Application
│   ├── app/
│   │   ├── api/                    # Route handlers (health, routing, evaluation, etc.)
│   │   ├── core/                   # XGBoost RouterEngine & simulation logic
│   │   ├── db/                     # Schemas & Supabase connection manager
│   │   ├── providers/              # Adapters for OpenAI, Claude, Gemini, Llama, DeepSeek
│   │   ├── config.py               # Pydantic v2 application settings
│   │   └── main.py                 # FastAPI application factory
│   ├── tests/                      # Automated test suite (verify_all_endpoints.py)
│   ├── render.yaml                 # Render Infrastructure-as-Code blueprint
│   └── requirements.txt            # Locked Python dependencies
├── frontend/                       # Next.js 14 Frontend Application
│   ├── src/
│   │   ├── app/                    # 8 App Router pages
│   │   ├── components/             # Reusable UI & Layout components
│   │   └── lib/                    # API client with simulation mock fallbacks & types
│   ├── package.json
│   └── tailwind.config.ts
├── ml_pipeline/                    # Reproducible ML Training & Artifacts
│   ├── artifacts/                  # Serialized corrected_model.ubj & metrics
│   └── src/
│       ├── preprocess.py           # LeakageFreePreprocessor (54 features)
│       └── train_leakage_free.py   # 5-fold CV & training script
├── research/                       # Original Unchanged Research Materials
│   ├── Adaptive_Cost-Aware_Semantic_Routing_Gateway_FINAL_THESIS.docx
│   ├── Adaptive_Cost_Aware_Semantic_Routing_Gateway Pre defence.pptx
│   ├── Adaptive_Cost_Aware_Semantic_Routing_Gateway.ipynb
│   ├── llm_routing_dataset.csv     # 30,000 queries, 37 columns
│   └── RESEARCH_METHODOLOGY.md     # Comprehensive academic methodology audit
├── supabase/                       # PostgreSQL Database Migrations
│   ├── migrations/                 # Version-controlled SQL schemas & RLS
│   └── seed.sql                    # Seed configurations for the 5 LLM families
├── DEPLOYMENT.md                   # Complete deployment manual (Render + Vercel + Supabase)
├── .env.example                    # Safe configuration template
└── README.md                       # Project documentation
```

---

## 7. Quickstart & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Atif12L/Adaptive-Cost-Awareness-Multi-LLM-Routing.git
cd Adaptive-Cost-Awareness-Multi-LLM-Routing
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend will be available at `http://localhost:8000`. Test endpoint: `http://localhost:8000/api/health`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Reproduce Model Training
To re-run the 5-fold cross-validation and generate fresh artifacts:
```bash
python ml_pipeline/src/train_leakage_free.py
```

---

## 8. API Specification

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health status, model warmup latency, and Supabase state |
| `/api/route` | POST | Submits query for XGBoost routing; returns recommended model and simulation response |
| `/api/models` | GET | Profiles and 2026 pricing for all 5 LLM families |
| `/api/evaluation/metrics` | GET | Historical reported vs. validated leakage-free metrics comparison |
| `/api/evaluation/confusion-matrix` | GET | Multiclass 5x5 confusion matrix |
| `/api/evaluation/feature-importance`| GET | Ranked arrival-time feature gains |
| `/api/dataset/summary` | GET | 30,000-record dataset metadata and attribute taxonomy |
| `/api/dataset/sample` | GET | Paginated, filtered query records |
| `/api/analytics/overview` | GET | Aggregated cost savings and latency reduction statistics |

---

## 9. Citation & Academic Reference

```bibtex
@thesis{atif2024adaptiverouting,
  title={An Adaptive Cost-Aware Semantic Routing Gateway for Multi-LLM Systems},
  author={Atif, H.},
  school={City University},
  year={2024},
  note={Undergraduate Final Thesis}
}
```

---

## 10. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
