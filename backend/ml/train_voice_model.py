import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    GradientBoostingClassifier,
    VotingClassifier,
    GradientBoostingRegressor
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report

FEATURE_NAMES_MAP = {
    0: "MFCC 1 (Pitch/Timbre)", 1: "MFCC 2 (Formants)", 2: "MFCC 3", 3: "MFCC 4",
    4: "MFCC 5", 5: "MFCC 6", 6: "MFCC 7", 7: "MFCC 8", 8: "MFCC 9", 9: "MFCC 10",
    10: "MFCC 11", 11: "MFCC 12", 12: "MFCC 13",
    13: "MFCC 1 Var", 14: "MFCC 2 Var", 15: "MFCC 3 Var", 16: "MFCC 4 Var",
    17: "MFCC 5 Var", 18: "MFCC 6 Var", 19: "MFCC 7 Var", 20: "MFCC 8 Var",
    21: "MFCC 9 Var", 22: "MFCC 10 Var", 23: "MFCC 11 Var", 24: "MFCC 12 Var", 25: "MFCC 13 Var",
    26: "Zero Crossing Rate (ZCR)", 27: "ZCR Variance",
    28: "RMS Vocal Energy", 29: "RMS Energy Variance",
    30: "Spectral Centroid (Brightness)", 31: "Spectral Centroid Var",
    32: "Spectral Bandwidth", 33: "Spectral Bandwidth Var",
    34: "Spectral Rolloff (High Freq)", 35: "Spectral Rolloff Var",
    36: "Fundamental Frequency (F0 Pitch)", 37: "Pitch Jitter Variance"
}

def train_voice_emotion_model():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    data_path = os.path.abspath(os.path.join(base_dir, '..', 'data', 'raw', 'voice_emotion_features.csv'))
    model_save_path = os.path.join(base_dir, 'models', 'voice_emotion_model.joblib')

    if not os.path.exists(data_path):
        from ml.generate_datasets import generate_voice_dataset
        generate_voice_dataset(data_path)

    df = pd.read_csv(data_path)
    feature_cols = [c for c in df.columns if c.startswith('f_')]
    X = np.array(df[feature_cols].values, dtype=np.float64)
    y_emotion = np.array(df['emotion'].values, dtype=str)
    y_stress = np.array(df['stress_indicator'].values, dtype=np.float64)

    # Stratified Train/Test Split
    X_train, X_test, y_emo_train, y_emo_test, y_str_train, y_str_test = train_test_split(
        X, y_emotion, y_stress, test_size=0.2, random_state=42, stratify=y_emotion
    )

    # Standard Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Base models for Soft-Voting Ensemble
    et_clf = ExtraTreesClassifier(n_estimators=180, max_depth=16, random_state=42)
    rf_clf = RandomForestClassifier(n_estimators=180, max_depth=14, random_state=42)
    gb_clf = GradientBoostingClassifier(n_estimators=140, learning_rate=0.08, max_depth=4, random_state=42)

    et_clf.fit(X_train_scaled, y_emo_train)
    rf_clf.fit(X_train_scaled, y_emo_train)

    ensemble_clf = VotingClassifier(
        estimators=[('et', et_clf), ('rf', rf_clf), ('gb', gb_clf)],
        voting='soft'
    )
    ensemble_clf.fit(X_train_scaled, y_emo_train)

    # Voice Stress Regressor
    regressor = GradientBoostingRegressor(
        n_estimators=140,
        learning_rate=0.06,
        max_depth=4,
        loss='huber',
        random_state=42
    )
    regressor.fit(X_train_scaled, y_str_train)

    # Evaluate
    y_emo_pred = ensemble_clf.predict(X_test_scaled)
    acc = accuracy_score(y_emo_test, y_emo_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_emo_test, y_emo_pred, average='weighted', zero_division=0)
    cm = confusion_matrix(y_emo_test, y_emo_pred, labels=ensemble_clf.classes_)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(ensemble_clf, X_train_scaled, y_emo_train, cv=cv)

    # Feature Importances (averaging ET and RF trees)
    importances = (et_clf.feature_importances_ + rf_clf.feature_importances_) / 2.0
    top_indices = np.argsort(importances)[::-1]
    feature_importance_dict = {}
    for idx in top_indices[:12]:
        fname = FEATURE_NAMES_MAP.get(idx, f"Feature_{idx}")
        feature_importance_dict[fname] = round(float(importances[idx]), 4)

    print("==================================================")
    print("ENHANCED ACOUSTIC SPEECH EMOTION ENSEMBLE MODEL")
    print("==================================================")
    print(f"Dataset Total Samples: {len(df)}")
    print(f"Test Accuracy:         {acc * 100:.2f}%")
    print(f"5-Fold CV Accuracy:    {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std()*100:.2f}%)")
    print(f"Weighted F1-Score:     {f1 * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_emo_test, y_emo_pred, zero_division=0))

    model_artifacts = {
        "scaler": scaler,
        "classifier": ensemble_clf,
        "regressor": regressor,
        "classes": ensemble_clf.classes_.tolist(),
        "feature_importances": feature_importance_dict,
        "metrics": {
            "accuracy": round(float(acc), 4),
            "cv_mean_accuracy": round(float(cv_scores.mean()), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1": round(float(f1), 4),
            "total_samples": len(df),
            "feature_count": X.shape[1],
            "classes": ensemble_clf.classes_.tolist()
        }
    }

    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    joblib.dump(model_artifacts, model_save_path)
    print(f"[Model Saved] Successfully saved voice model to: '{model_save_path}'")
    return model_artifacts

if __name__ == "__main__":
    train_voice_emotion_model()
