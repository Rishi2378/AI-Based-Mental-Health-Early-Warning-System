# System Architecture Specification

## 1. High-Level Modular Design

MindGuard AI follows a decoupled, modular multi-tier architecture separating the React.js client interface, Flask REST API gateway, domain processing services, machine learning inference engines, and persistent SQLite database layer.

```
+-----------------------------------------------------------------------+
|                           USER INTERFACE                              |
|   React.js 18 + Vite + Tailwind CSS + Lucide Icons + Recharts        |
+-----------------------------------------------------------------------+
                                   |
                             REST API (JSON)
                                   v
+-----------------------------------------------------------------------+
|                        FLASK BACKEND GATEWAY                          |
|   app.py | CORS | Blueprint Routing | Error Handling Middleware      |
+-----------------------------------------------------------------------+
                                   |
       +---------------------------+---------------------------+
       |                           |                           |
       v                           v                           v
+------------------+     +-------------------+     +-------------------+
|  Text Service    |     |   Voice Service   |     | Questionnaire Svc |
|  NLP Pipeline    |     |  Acoustic Engine  |     |   Score Engine    |
+------------------+     +-------------------+     +-------------------+
       |                           |                           |
       +---------------------------+---------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                      MULTIMODAL FUSION ENGINE                         |
|   Weighted Synthesis: (Text × 0.40) + (Voice × 0.30) + (Quest × 0.30) |
+-----------------------------------------------------------------------+
                                   |
       +---------------------------+---------------------------+
       |                                                       |
       v                                                       v
+-------------------------------+             +-------------------------+
| Recommendation & Safety Engine|             |   SQLite Database       |
|  Rule-Based Suggestions       |             |   SQLAlchemy ORM        |
+-------------------------------+             +-------------------------+
```

## 2. Layer Responsibilities

- **Frontend Client**: Modern responsive single-page web app presenting real-time audio waveform canvas visualizer, journal entry text analysis interface, 10-item self-assessment questionnaire, interactive Recharts dashboard, historical assessment analytics, and configurable fusion weights settings.
- **REST Gateway**: Flask blueprints handling endpoint validation, CORS header configuration, audio file upload stream processing, and HTTP status code mappings.
- **NLP Text Pipeline**: Token cleaning, lowercased normalization, TF-IDF ngram vectorization, Logistic Regression emotion classification, Ridge stress regression, and top feature contribution extraction.
- **Audio Processing Engine**: File format validation, 38-dimensional signal feature extraction (MFCCs, ZCR, RMS Energy, Spectral Centroid, Rolloff, Pitch F0) via Librosa, Random Forest classifier, and automatic raw audio file deletion for privacy compliance.
- **Multimodal Fusion Engine**: Dynamic re-weighting fusion algorithm supporting complete or partial modality combinations.
- **Database Storage**: SQLite database managed via SQLAlchemy ORM tracking user records, assessment logs, component scores, top TF-IDF features, acoustic feature summaries, and recommendations.
