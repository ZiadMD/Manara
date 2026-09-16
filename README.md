# Basira (بصيره) — Digital Screening Platform for Early Psychological Detection

A validated, normed digital screening platform for early detection of psychological-disorder indicators in middle and high school students (المرحلتين المتوسطة والثانوية).

Built according to strict psychometric specifications, preserving exact validated Arabic item wording, fixed domain order, deterministic T-score/percentile scoring formulas, a standalone configurable self-harm safety override, and strict role-based access control.

---

## 1. System Architecture & Features

- **Standardized Instrument**: Full 61-item bank across 5 psychological domains administered in fixed sequence:
  1. **Anxiety (القلق)** — Items 1–13 (Count: 13, Mean: 32.56, SD: 12.40)
  2. **Depression (الاكتئاب)** — Items 14–27 (Count: 14, Mean: 30.70, SD: 12.96)
  3. **Behavior & Discipline Problems (مشكلات السلوك والانضباط)** — Items 28–39 (Count: 12, Mean: 21.26, SD: 8.85)
  4. **Self-Harm / Suicidal Ideation (إيذاء الذات/الأفكار الانتحارية)** — Items 40–49 (Count: 10, Mean: 17.94, SD: 9.34)
  5. **School Maladjustment (ضعف التكيف المدرسي)** — Items 50–61 (Count: 12, Mean: 28.09, SD: 10.30)
- **Deterministic Scoring Engine**:
  - $T = 50 + 10 \times \frac{X - \text{Mean}}{\text{SD}}$
  - Reverse-scoring rule: only items 50, 51, 52, 54, 55, 56, 58, 59, 60 ($\text{reversed} = 6 - \text{raw}$).
  - Screening levels: Low ($T < 60$), Medium ($60 \le T < 65$), High ($65 \le T < 70$), Very High ($T \ge 70$).
  - Percentile lookup from normative reference tables (Section 7).
  - **Zero composite score**: No cross-domain composite score is ever computed or shown.
- **Standalone Safety Override Check**:
  - Evaluated independently of the domain T-score.
  - Direct-risk candidate items (default: `[42, 43, 45, 46, 48, 49]`) with response threshold $\ge 4$ trigger an immediate `safety_flags` record (`status: open`).
  - Configurable dynamically by admins without code changes.
- **Mandatory In-App Safety Notice**:
  - Presented verbatim immediately after Domain 4 before Domain 5.
  - Unskippable with mandatory acknowledgment.
- **Role-Based Access Control (RBAC)**:
  - **Student**: Completes background information and 61 items; receives a neutral, reassuring completion confirmation; never sees clinical scores.
  - **Counselor**: Full access to assigned student reports, multi-domain profile, item breakdown, and open safety flags triage queue.
  - **Admin**: Strictly de-identified aggregate statistics and safety configuration administration; blocked from viewing individual psychological records.

---

## 2. Tech Stack

- **Backend**: Python 3.14+, FastAPI, SQLAlchemy 2.0 (Async), Alembic, Pydantic V2, PyJWT.
- **Database**: PostgreSQL 16 (production/docker) & SQLite in-memory (automated test runner).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Language & Direction**: Bilingual (Arabic RTL default, English LTR toggle).

---

## 3. Quick Start with Docker Compose

Run the entire platform (PostgreSQL, FastAPI Backend, React Frontend):

```bash
docker compose up --build
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/api/docs`

---

## 4. Local Development Setup

### Backend

```bash
cd backend
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt

# Run migrations
.venv/bin/alembic upgrade head

# Run server
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 5. Running Automated Tests

A comprehensive test suite validates:
1. Exact T-Score formulas and rounding
2. Reverse scoring rules on designated items
3. Section 7 percentile normative lookup tables
4. Independence of safety override from T-scores
5. Strict RBAC role access boundaries
6. Complete intake submission flow

```bash
cd backend
.venv/bin/pytest -v
```

---

## 6. Seed Demo Accounts

Default demo accounts available out of the box:

| Role | Email | Password |
|---|---|---|
| Student | `student@manara.school` | `Password123!` |
| Counselor | `counselor@manara.school` | `Password123!` |
| Admin | `admin@manara.school` | `Password123!` |

---

## 7. Open Questions for Psychometric & Administrative Alignment

1. **Exact direct-risk item list & threshold**: Confirm official psychometric key for items triggering the self-harm override (currently configured as items `[42, 43, 45, 46, 48, 49]` at threshold $\ge 4$).
2. **Norm differentiation by stage**: Confirm whether norms should differ between Middle School (متوسط) and High School (ثانوي) if stage-specific reference tables are provided.
3. **Data Residency**: Verify regional data residency requirements (e.g. KSA PDPL / NDMO) for minors' data.
4. **Consent Flow**: Finalize explicit parental and school consent requirements prior to student intake.
