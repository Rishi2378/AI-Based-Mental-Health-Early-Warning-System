# Machine Learning & Audio Signal Processing Pipeline

## 1. Natural Language Processing (NLP) Pipeline

```
Raw Journal Text
      │
      ▼
Text Cleaning & Normalization (Lowercasing, Punctuation Removal)
      │
      ▼
Tokenization & Stop Words Removal
      │
      ▼
TF-IDF Feature Extraction (Unigrams + Bigrams, 1500 Max Features)
      │
      ├──────────────────────────────┐
      ▼                              ▼
Logistic Regression Classifier    Ridge Regression Model
(Predicts 6 Emotion Classes)    (Predicts 0-100 Stress Indicator)
      │                              │
      └──────────────┬───────────────┘
                     ▼
       Top Feature Explainability & Probabilities
```

### Emotion Categories
- `Neutral`
- `Positive`
- `Sadness`
- `Anger`
- `Anxiety`
- `Stress`

---

## 2. Voice Audio Signal Processing Pipeline

```
Audio Recording (.wav / .webm / .mp3)
      │
      ▼
Audio Integrity & Validation (Duration check 0.5s - 60s, Sample Rate)
      │
      ▼
Librosa Signal Preprocessing (Mono conversion, Trim Silence)
      │
      ▼
38-Dimensional Feature Extraction Matrix:
 - 13 MFCC Means + 13 MFCC Standard Deviations (26)
 - Zero Crossing Rate Mean & Std (2)
 - RMS Energy Mean & Std (2)
 - Spectral Centroid Mean & Std (2)
 - Spectral Bandwidth Mean & Std (2)
 - Spectral Rolloff Mean & Std (2)
 - Pitch F0 Estimation Mean & Std (2)
      │
      ▼
StandardScaler Normalization
      │
      ├──────────────────────────────┐
      ▼                              ▼
Random Forest Classifier          Ridge Regression Model
(Predicts Speech Emotion)       (Predicts Voice Stress Index)
```

---

## 3. Acoustic Feature Definitions

1. **MFCCs (Mel-Frequency Cepstral Coefficients)**: Captures spectral shape of vocal tract filter.
2. **Zero Crossing Rate (ZCR)**: Measure of vocal noise and high-frequency energy.
3. **RMS Energy**: Root Mean Square signal magnitude representing vocal volume and intensity variations.
4. **Spectral Centroid**: Represents the "center of mass" of the spectrum, correlated with vocal brightness or tension.
5. **Spectral Rolloff**: Frequency below which 85% of signal energy lies.
6. **Pitch (F0)**: Fundamental frequency estimated via autocorrelation/pyin tracking, indicating pitch height and voice pitch variability.
