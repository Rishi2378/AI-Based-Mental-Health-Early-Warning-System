import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import VotingClassifier, GradientBoostingRegressor, ExtraTreesClassifier
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support, confusion_matrix

def train_text_nlp_model():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    data_path = os.path.abspath(os.path.join(base_dir, '..', 'data', 'raw', 'nlp_mental_health_dataset.csv'))
    model_save_path = os.path.join(base_dir, 'models', 'text_nlp_model.joblib')

    if not os.path.exists(data_path):
        from ml.generate_datasets import generate_nlp_dataset
        generate_nlp_dataset(data_path)

    df = pd.read_csv(data_path)
    X = df['text'].astype(str)
    y_emotion = df['emotion'].astype(str)
    y_stress = df['stress_indicator'].astype(float)

    # Stratified Train/Test Split (80% / 20%)
    X_train, X_test, y_emo_train, y_emo_test, y_str_train, y_str_test = train_test_split(
        X, y_emotion, y_stress, test_size=0.2, random_state=42, stratify=y_emotion
    )

    # Enhanced TF-IDF Vectorizer (word n-grams 1 to 3 with lower min_df to capture affective cues)
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),
        max_features=5000,
        sublinear_tf=True,
        min_df=1,
        strip_accents='unicode',
        stop_words='english'
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Base models for Soft-Voting Ensemble
    # L2 regularized Logistic Regression with balanced weights
    clf_lr = LogisticRegression(C=3.0, max_iter=1000, class_weight='balanced', random_state=42)
    # Calibrated Linear Support Vector Machine
    clf_svc = CalibratedClassifierCV(LinearSVC(C=1.5, dual=False, class_weight='balanced', random_state=42))
    # Multi-Layer Perceptron Neural Net
    clf_mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=500, early_stopping=True, random_state=42)
    # ExtraTrees Classifier with deeper trees for robust bag-of-words voting
    clf_et = ExtraTreesClassifier(n_estimators=150, max_depth=None, min_samples_split=3, random_state=42)

    ensemble_clf = VotingClassifier(
        estimators=[
            ('lr', clf_lr),
            ('svc', clf_svc),
            ('mlp', clf_mlp),
            ('et', clf_et)
        ],
        voting='soft'
    )
    ensemble_clf.fit(X_train_vec, y_emo_train)

    # Gradient Boosting Stress Indicator Regressor
    regressor = GradientBoostingRegressor(
        n_estimators=160,
        learning_rate=0.06,
        max_depth=4,
        loss='huber',
        random_state=42
    )
    regressor.fit(X_train_vec, y_str_train)

    # Evaluation
    y_emo_pred = ensemble_clf.predict(X_test_vec)
    acc = accuracy_score(y_emo_test, y_emo_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_emo_test, y_emo_pred, average='weighted', zero_division=0)
    cm = confusion_matrix(y_emo_test, y_emo_pred, labels=ensemble_clf.classes_)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(ensemble_clf, X_train_vec, y_emo_train, cv=cv)

    print("==================================================")
    print("ENHANCED MULTI-GRANULARITY NLP ENSEMBLE MODEL")
    print("==================================================")
    print(f"Dataset Total Samples: {len(df)}")
    print(f"Vocabulary Features:   {len(vectorizer.get_feature_names_out())} n-grams")
    print(f"Test Accuracy:         {acc * 100:.2f}%")
    print(f"5-Fold CV Accuracy:    {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std()*100:.2f}%)")
    print(f"Weighted F1-Score:     {f1 * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_emo_test, y_emo_pred, zero_division=0))

    model_artifacts = {
        "vectorizer": vectorizer,
        "classifier": ensemble_clf,
        "regressor": regressor,
        "classes": ensemble_clf.classes_.tolist(),
        "metrics": {
            "accuracy": round(float(acc), 4),
            "cv_mean_accuracy": round(float(cv_scores.mean()), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1": round(float(f1), 4),
            "total_samples": len(df),
            "vocabulary_size": len(vectorizer.get_feature_names_out()),
            "classes": ensemble_clf.classes_.tolist()
        }
    }

    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    joblib.dump(model_artifacts, model_save_path)
    print(f"[Model Saved] Successfully saved text model to: '{model_save_path}'")
    return model_artifacts

if __name__ == "__main__":
    train_text_nlp_model()
