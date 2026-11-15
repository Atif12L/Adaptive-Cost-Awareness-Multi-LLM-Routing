# Production Deployment Guide
## Adaptive Cost-Aware Semantic Routing Gateway for Multi-LLM Systems

This guide provides step-by-step instructions for deploying the full-stack system across **Vercel** (Frontend), **Render** (FastAPI Backend), and **Supabase** (PostgreSQL Database).

---

## 1. Architecture Overview

```
                        +---------------------------------------+
                        |           Next.js Frontend            |
                        |          (Hosted on Vercel)           |
                        +---------------------------------------+
                                            |
                                            | REST API / HTTPS
                                            v
                        +---------------------------------------+
                        |           FastAPI Gateway             |
                        |          (Hosted on Render)           |
                        +---------------------------------------+
                           /                |                 \
                          /                 |                  \
                         v                  v                   v
      +--------------------+     +--------------------+   +--------------------+
      |  XGBoost Engine    |     |  Supabase Postgres |   |  Provider Adapters |
      | (corrected_model)  |     |   (RLS Enabled)    |   | (OpenAI, Anthropic,|
      |   [Native UBJ]     |     |                    |   |  Gemini, Groq, DS) |
      +--------------------+     +--------------------+   +--------------------+
```

---

## 2. Supabase PostgreSQL Deployment

The database runs on Supabase:
- **Project URL:** `https://tibnobwsfhrdpdbqdpux.supabase.co`

### Step 2.1: Apply SQL Migrations
1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/tibnobwsfhrdpdbqdpux).
2. Navigate to the **SQL Editor**.
3. Copy the contents of `supabase/migrations/20261115000001_create_routing_tables.sql` and run it:
   - Creates `model_configurations` table with JSONB pricing and capability fields.
   - Creates `routing_requests` table with query telemetry, predicted model, and latency.
   - Creates `experiment_runs` table for benchmark audit tracking.
   - Enables Row Level Security (RLS) on all tables with public read and authenticated write policies.
4. Copy the contents of `supabase/seed.sql` and run it to populate default model configurations (GPT, Claude, Gemini, Llama, DeepSeek).

### Step 2.2: Obtain Credentials
Under **Project Settings -> API**:
- Copy the **Project URL** (`https://tibnobwsfhrdpdbqdpux.supabase.co`).
- Copy the **anon public API key**.
- Copy the **service_role secret key** (keep private, used by FastAPI backend).

---

## 3. Backend Deployment on Render

The FastAPI backend is container-ready and includes a native `render.yaml` specification.

### Step 3.1: Connect Repository
1. Log in to [Render](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository:
   `https://github.com/Atif12L/Adaptive-Cost-Awareness-Multi-LLM-Routing`

### Step 3.2: Configure Web Service
- **Name:** `adaptive-llm-routing-backend`
- **Environment:** `Python 3`
- **Root Directory:** `backend`
- **Build Command:**
  ```bash
  pip install --upgrade pip && pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- **Health Check Path:** `/api/health`

### Step 3.3: Configure Environment Variables
Set the following in the Render Environment Variables tab:

| Variable | Value | Description |
|---|---|---|
| `ENVIRONMENT` | `production` | Production environment flag |
| `FRONTEND_URL` | `https://adaptive-llm-routing.vercel.app` | Allowed CORS origin |
| `SUPABASE_URL` | `https://tibnobwsfhrdpdbqdpux.supabase.co` | Supabase endpoint |
| `SUPABASE_KEY` | `<your-supabase-anon-key>` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `<your-supabase-service-key>` | Backend service key |
| `SIMULATION_MODE` | `true` | Defaults to zero-cost simulation |
| `OPENAI_API_KEY` | *(optional)* | OpenAI API key for live inference |
| `ANTHROPIC_API_KEY` | *(optional)* | Anthropic API key |
| `GEMINI_API_KEY` | *(optional)* | Google Gemini API key |
| `GROQ_API_KEY` | *(optional)* | Groq / Llama API key |
| `DEEPSEEK_API_KEY` | *(optional)* | DeepSeek API key |

Render will automatically deploy and assign a public URL (e.g. `https://adaptive-llm-routing-backend.onrender.com`).

---

## 4. Frontend Deployment on Vercel

The Next.js 14 App Router dashboard is optimized for Vercel deployment.

### Step 4.1: Import Project
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import `https://github.com/Atif12L/Adaptive-Cost-Awareness-Multi-LLM-Routing`.

### Step 4.2: Configure Project Settings
- **Framework Preset:** `Next.js`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### Step 4.3: Set Environment Variables
Under the Vercel Environment Variables section:

| Variable | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://adaptive-llm-routing-backend.onrender.com` | Live Render backend endpoint |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tibnobwsfhrdpdbqdpux.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<your-supabase-anon-key>` | Supabase anon key |

### Step 4.4: Deploy
Click **Deploy**. Vercel will build the production bundle and assign your production domain.

---

## 5. Post-Deployment Verification Checklist

- [ ] **Backend Health Check:** Visit `https://<backend-url>/api/health` -> returns `{"status": "healthy", "model_loaded": true}` in <50ms.
- [ ] **Model Information Endpoint:** Visit `https://<backend-url>/api/models` -> returns 5 models with 2026 pricing and capabilities.
- [ ] **Routing Playground:** Open frontend `/playground`, submit a sample query, verify recommendation and simulated token response.
- [ ] **Evaluation Page:** Open frontend `/evaluation`, verify side-by-side historical (97.70%) vs. validated leakage-free (58.62%) metrics.
- [ ] **Dataset Explorer:** Open frontend `/dataset`, verify 30,000 query row counts and feature taxonomy tables.
- [ ] **CORS Verification:** Verify frontend requests from Vercel domain succeed without pre-flight CORS errors.
