# Limitations, Non-Diagnostic Disclaimer & Safety Boundaries

## 1. Non-Diagnostic Medical Disclaimer

MindGuard AI is an academic research and technical demonstration project. **It is NOT a medical diagnostic tool and must NEVER be used to make clinical medical decisions, diagnose mental health conditions (such as Major Depressive Disorder or Generalized Anxiety Disorder), or prescribe treatments.**

The system's outputs are project-defined non-diagnostic indicators intended solely for self-reflection and general wellness tracking.

## 2. Technical Limitations

1. **Acoustic Noise Sensitivity**: Speech audio processing results can vary depending on microphone hardware quality, background environmental noise, and audio recording volume.
2. **Short Text Input Constraints**: Text journal entries shorter than 3–4 words contain insufficient linguistic signal for reliable TF-IDF vectorization; the system appropriately flags short inputs as "Insufficient information" rather than forcing false predictions.
3. **Synthetic / Public Dataset Scope**: Baseline models are trained on representative dataset distributions. Performance across diverse accents, dialects, and languages requires further dataset fine-tuning.
4. **Correlation vs Causality**: Feature contributions (such as top TF-IDF words or pitch variations) are statistical correlates and do not constitute causal proof of emotional state.

## 3. Ethical & Safety Design

- **Crisis Escalation Protocol**: The system incorporates immediate safety filters that detect explicit crisis language (e.g. self-harm, suicidal ideation) and present 24/7 confidential helplines (**988 Suicide & Crisis Lifeline**, **Crisis Text Line**, **Befrienders Worldwide**).
- **Privacy-First Data Policy**: Raw voice audio recordings are never stored permanently; temporary files are purged from disk immediately following acoustic feature extraction.
