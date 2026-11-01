# Project Estimation & Software Engineering Metrics

This document contains the detailed software engineering estimation metrics, project sizing analysis, Basic COCOMO effort/duration modeling, and cost estimation for the **MindGuard AI – Multimodal Mental Health Early Warning and Wellness Support System**.

---

## 4.3. Project Size Estimation

### 1. What is Project Size Estimation?
**Project Size Estimation** is the foundational software metric process used to quantify the physical or functional scope of a software application before and during development. It serves as the primary input parameter for algorithmic cost, effort, and scheduling models (such as Barry Boehm’s Constructive Cost Model). Size is typically measured in **Lines of Code (LOC)** or **Source Lines of Code (SLOC)**—representing executable instructions, declarations, and formatting, excluding blank lines—and is converted to **Kilo Lines of Code (KLOC)**, where:

$$\text{KLOC} = \frac{\text{Total LOC}}{1000}$$

### 2. Identification of Major Modules & Exact Codebase Size

Based on an architectural code audit of the MindGuard AI source repository, the project is structured into six functional modules:

| Major Project Module | Key Technologies / Components | Lines of Code (LOC) |
|:---|:---|:---:|
| **Frontend UI & Presentation Layer** | React 18, JSX Pages, Spatial Glassmorphism, Tailwind CSS, Recharts, In-Browser WAV Audio Recorder | **4,102** |
| **Backend REST API & Business Logic** | Flask 3.0 Blueprints, Multimodal Fusion Engine, Text NLP Service, Voice Service, Crisis Gate | **1,034** |
| **Machine Learning & Signal Extraction** | Librosa 38-feature signal extractor, TF-IDF Vectorizer, Soft-Voting Ensembles, Training Pipelines | **762** |
| **Database Models & ORM Schema** | SQLAlchemy 2.0 ORM models (`Assessment`, `TextResult`, `VoiceResult`, `Recommendation`, `User`) | **128** |
| **Automated Testing Suite** | Pytest harnesses for API endpoints, fusion weight normalization, and crisis interception | **138** |
| **Deployment, Automation & Orchestration** | Turnkey batch runner (`run_project.bat`), WSGI server (`wsgi.py`), Dockerfile, docker-compose, cloud manifests | **267** |
| **Total Physical Source Code** | **Full Project Codebase** | **6,431** |

$$\text{Total LOC} = 6,431$$
$$\text{Total KLOC} = \frac{6,431}{1000} = \mathbf{6.431 \text{ KLOC}} \approx \mathbf{6.43 \text{ KLOC}}$$

---

## 4.4. COCOMO-Based Effort Estimation

### 4.4.1. Introduction
The **Constructive Cost Model (COCOMO)**, formulated by Dr. Barry W. Boehm in 1981, is an empirical, algorithmic software estimation model. It uses historical project data to derive mathematical relationships between a software system's size (in KLOC) and the parameters needed to deliver it: **personnel effort**, **calendar development schedule**, and **staffing allocation**. 

**Why COCOMO is Used:**
1. **Objective Budgeting & Scheduling**: Prevents arbitrary guessing by providing proven mathematical equations.
2. **Resource Optimization**: Estimates how many software engineers are required across various project lifecycle phases.
3. **Risk Management**: Establishes realistic deadlines, avoiding common project pitfalls such as premature deployment or scope creep.

---

### 4.4.2. Basic COCOMO Model

The **Basic COCOMO Model** is a static, single-variable model that calculates effort and development duration solely as a function of program size expressed in thousand delivered lines of code (KLOC).

#### Standard Formulas:
1. **Effort ($E$):**
   $$E = a \times (\text{KLOC})^b \quad \text{[Person-Months (PM)]}$$
   *(A Person-Month represents the productive work accomplished by one team member in one calendar month).*

2. **Development Time ($D$):**
   $$D = c \times (E)^d \quad \text{[Calendar Months]}$$

3. **Average Team Size ($SS$):**
   $$\text{Team Size} = \frac{E}{D} \quad \text{[Persons]}$$

Where $a$, $b$, $c$, and $d$ are empirically derived constants determined by the project's complexity mode.

---

### 4.4.3. Selection of COCOMO Mode

COCOMO categorizes software projects into three distinct development modes based on technical complexity, environmental constraints, and team experience:

| COCOMO Mode | System Characteristics | $a$ | $b$ | $c$ | $d$ |
|:---|:---|:---:|:---:|:---:|:---:|
| **Organic** | Small-scale projects, well-understood problem domain, relaxed constraints, small experienced team. | $2.4$ | $1.05$ | $2.5$ | $0.38$ |
| **Semi-Detached** | Intermediate project size and complexity, mixed team experience, moderately tight deadlines and interface requirements. | $3.0$ | $1.12$ | $2.5$ | $0.35$ |
| **Embedded** | Highly complex systems, rigid hardware/system constraints, stringent regulatory compliance (e.g. aerospace, medical device firmware). | $3.6$ | $1.20$ | $2.5$ | $0.32$ |

#### Mode Selection & Justification for MindGuard AI:
**Selected Mode:** **Semi-Detached Mode**

**Justification:**
1. **Multimodal Algorithmic Complexity**: The application is not a straightforward CRUD system (which would qualify for Organic). It integrates multi-domain DSP (digital signal processing via Librosa), in-browser 16-bit PCM WAV encoding, mathematical fusion algorithms, and a 4-model soft-voting scikit-learn ensemble.
2. **Diverse Technology Ecosystem**: The development requires coordinating heterogeneous stacks: React 18, Tailwind CSS, Vite, Flask REST APIs, SQLAlchemy, and Python scientific computing libraries.
3. **Safety & Real-Time Constraints**: The presence of an immediate crisis keyword interception gate and audio validation constraints (pitch jitter checking, silence gating) demands moderate architectural rigor, making **Semi-Detached** the most technically accurate model.

---

### 4.4.4. Effort Estimation

#### What is Effort Estimation?
**Effort Estimation** is the process of forecasting the total amount of labor or work hours (quantified in Person-Months) required by software developers and engineers to design, implement, test, and package a software product.

Using the **Semi-Detached Mode** coefficients:
- $a = 3.0$
- $b = 1.12$
- $\text{Size} = 6.43 \text{ KLOC}$

$$E = a \times (\text{KLOC})^b$$
$$E = 3.0 \times (6.43)^{1.12}$$

Calculating the exponent:
$$(6.43)^{1.12} \approx 7.973$$
$$E = 3.0 \times 7.973 \approx \mathbf{23.92 \text{ Person-Months (PM)}}$$

> **Interpretation**: Delivering the complete system from scratch under industrial baseline conditions would require approximately **23.92 person-months** of engineering effort.

---

### 4.4.5. Development Time Estimation

#### What is Development Time Estimation?
**Development Time Estimation** calculates the calendar duration (in months) necessary to complete all software development lifecycle stages, assuming the calculated level of engineering effort is distributed across an appropriately sized development team.

Using the **Semi-Detached Mode** coefficients:
- $c = 2.5$
- $d = 0.35$
- $E = 23.92 \text{ PM}$

$$D = c \times (E)^d$$
$$D = 2.5 \times (23.92)^{0.35}$$

Calculating the exponent:
$$(23.92)^{0.35} \approx 3.036$$
$$D = 2.5 \times 3.036 \approx \mathbf{7.59 \text{ Months}} \approx \mathbf{7.6 \text{ Months}}$$

> **Interpretation**: The ideal nominal calendar development lifecycle spans approximately **7.6 calendar months**.

---

### 4.4.6. Estimated Team Size

#### What is Estimated Team Size?
**Estimated Team Size** determines the average number of personnel (developers, designers, testers) required concurrently throughout the development schedule to deliver the project within the estimated development time.

1. **Estimated Average Team Size ($SS$):**
   $$\text{Estimated Team Size} = \frac{E}{D} = \frac{23.92 \text{ PM}}{7.59 \text{ Months}} \approx \mathbf{3.15 \text{ Persons}} \approx \mathbf{3 \text{ to 4 Developers}}$$

2. **Actual Team Size:**
   - **Academic / Project Team Size**: **3 Members** (or **1 to 3 Core Developers** depending on institutional capstone assignment).
   - **Alignment**: The calculated nominal team size of **3.15 persons** closely matches standard 3-person capstone/academic development teams, validating the project's feasibility within an academic semester schedule.

---

## 4.5. Cost Estimation

### 1. What is Cost Estimation?
**Cost Estimation** is the financial evaluation of all tangible and intangible expenditures required to plan, construct, test, deploy, and maintain a software product. It accounts for personnel salaries, hardware capital expenses, proprietary software licenses, cloud compute infrastructure, and contingency reserves.

### 2. Project Cost Breakdown (Academic / Demonstration Prototype)

*(Values are estimated based on prevailing developer rates and cloud tiering in INR / USD equivalence)*:

| Cost Component | Description & Specification | Estimated Cost (INR) | Estimated Cost (USD) |
|:---|:---|:---:|:---:|
| **1. Personnel Cost** | 3 Engineers working over a 4-month active sprint cycle (~₹25,000 / $300 stipend per engineer/month) | ₹3,00,000 | \$3,600 |
| **2. Hardware & Workstation** | Existing local developer PCs, multi-core CPU/GPU for training ML models (amortized workstation utility) | ₹35,000 | \$420 |
| **3. Software, Tooling & IDEs** | VS Code, Git, Python, React, Librosa, Scikit-Learn, SQLite, Docker Community (All Open-Source / MIT) | **₹0** (FOSS) | **\$0** (Free) |
| **4. Cloud Hosting & Deployment** | Render / Railway PaaS Web Service hosting container, persistent storage disk, SSL certificate | ₹12,500 | \$150 |
| **5. Internet, Datasets & Utilities** | High-speed fiber connectivity, research dataset curation, and testing contingencies | ₹15,000 | \$180 |
| **Total Estimated Project Cost** | **Comprehensive Turnkey Expenditure** | **₹3,62,500** | **\$4,350** |

---

## 4.6. Summary of Estimation Results

The following table synthesizes the complete software engineering metrics and algorithmic cost estimation results for the **MindGuard AI** project:

| Estimation Metric | Metric Value / Designation |
|:---|:---|
| **Total Physical Lines of Code (LOC)** | **6,431 LOC** |
| **Kilo Lines of Code (KLOC)** | **6.43 KLOC** |
| **Selected COCOMO Mode** | **Semi-Detached Mode** |
| **COCOMO Constants** | $a = 3.0, \; b = 1.12, \; c = 2.5, \; d = 0.35$ |
| **Estimated Effort ($E$)** | **23.92 Person-Months** |
| **Estimated Development Time ($D$)** | **7.59 Months (~7.6 Months)** |
| **Calculated Average Team Size** | **3.15 Persons (~3 Developers)** |
| **Actual Team Size** | **3 Members** (Capstone / Project Group) |
| **Total Estimated Project Cost** | **₹3,62,500 INR (\$4,350 USD)** |
