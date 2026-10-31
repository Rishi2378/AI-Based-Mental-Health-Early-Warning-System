# Database Schema Specification

## Relational Entity ER-Diagram

```
+----------------+          +-----------------------+          +--------------------+
|     Users      | 1      * |      Assessments      | 1      1 |    TextResults     |
+----------------+----------+-----------------------+----------+--------------------+
| id (PK)        |          | id (PK)               |          | id (PK)            |
| name           |          | user_id (FK)          |          | assessment_id (FK) |
| email          |          | created_at            |          | sentiment          |
| created_at     |          | text_score            |          | emotion            |
+----------------+          | voice_score           |          | confidence         |
                            | questionnaire_score   |          | stress_indicator   |
                            | overall_score         |          | top_features_json  |
                            | category              |          | text_sample        |
                            | is_crisis             |          +--------------------+
                            +-----------------------+
                                        | 1
                                        |
       +--------------------------------+--------------------------------+
       | 1                                                               | 1
       v                                                                 v
+--------------------+                                         +--------------------+
|    VoiceResults    |                                         |  Recommendations   |
+--------------------+                                         +--------------------+
| id (PK)            |                                         | id (PK)            |
| assessment_id (FK) |                                         | assessment_id (FK) |
| emotion            |                                         | recommendation_text|
| indicator          |                                         +--------------------+
| confidence         |
| features_json      |
+--------------------+
```

## Entity Descriptions

1. **`users`**: Stores user identity and registration timestamp.
2. **`assessments`**: Core evaluation log recording timestamps, individual modality scores (text, voice, questionnaire), overall fused multimodal score, category status (`LOW`, `MODERATE`, `ELEVATED`), and crisis override status.
3. **`text_results`**: Detailed NLP sentiment, predicted emotion, confidence score, top TF-IDF key terms, and raw text sample.
4. **`voice_results`**: Detailed acoustic speech emotion, voice stress score, confidence level, and JSON summary of pitch/energy signal metrics.
5. **`questionnaire_results`**: Detailed raw questionnaire score and JSON dictionary of 10 answer values.
6. **`recommendations`**: JSON array of non-diagnostic wellness suggestions generated for the assessment.
