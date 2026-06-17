import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder
import joblib

# Create artifacts folder
ARTIFACTS_DIR = os.path.dirname(os.path.abspath(__file__)) + "/artifacts"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def train_and_save_models():
    print("Generating synthetic student dataset...")
    np.random.seed(42)
    n_samples = 1000

    # 1. Performance Predictor Data
    # Features: avg_quiz_score (0-100), avg_assess_score (0-100), progress_pct (0-100)
    quiz_scores = np.random.uniform(30, 95, n_samples)
    assess_scores = np.random.uniform(25, 95, n_samples)
    progress_pct = np.random.uniform(10, 100, n_samples)
    
    # Target: future_score = weighted average with some random noise
    future_scores = (0.4 * quiz_scores + 0.4 * assess_scores + 0.2 * progress_pct) + np.random.normal(0, 5, n_samples)
    future_scores = np.clip(future_scores, 0, 100)

    X_perf = pd.DataFrame({
        "avg_quiz_score": quiz_scores,
        "avg_assess_score": assess_scores,
        "progress_pct": progress_pct
    })
    y_perf = future_scores

    print("Training Performance Regressor model...")
    perf_model = RandomForestRegressor(n_estimators=50, random_state=42)
    perf_model.fit(X_perf, y_perf)
    joblib.dump(perf_model, f"{ARTIFACTS_DIR}/perf_predictor.joblib")

    # 2. Recommendation Engine Data
    # Features: class_level (5-10), language (English, Hindi, Telugu, Tamil), weak_subject (Math, Science, English, Social)
    classes = np.random.choice(["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"], n_samples)
    languages = np.random.choice(["English", "Hindi", "Telugu", "Tamil"], n_samples)
    weak_subjects = np.random.choice(["Math", "Science", "English", "Social"], n_samples)

    # Encode categories
    le_class = LabelEncoder()
    le_lang = LabelEncoder()
    le_weak = LabelEncoder()

    classes_encoded = le_class.fit_transform(classes)
    languages_encoded = le_lang.fit_transform(languages)
    weak_subjects_encoded = le_weak.fit_transform(weak_subjects)

    # Target: Recommended course category
    # Simple rule-based logic to assign target category based on weak subject
    rec_categories = []
    for ws in weak_subjects:
        if ws == "Math":
            rec_categories.append("Mathematics & Algebra")
        elif ws == "Science":
            rec_categories.append("General Science & Physics")
        elif ws == "English":
            rec_categories.append("English Grammar & Vocab")
        else:
            rec_categories.append("Social Studies & Geography")
    
    le_rec = LabelEncoder()
    y_rec = le_rec.fit_transform(rec_categories)

    X_rec = pd.DataFrame({
        "class_level": classes_encoded,
        "language": languages_encoded,
        "weak_subject": weak_subjects_encoded
    })

    print("Training Course Recommendation Classifier model...")
    rec_model = RandomForestClassifier(n_estimators=50, random_state=42)
    rec_model.fit(X_rec, y_rec)

    # Save models and encoders
    joblib.dump(rec_model, f"{ARTIFACTS_DIR}/rec_engine.joblib")
    joblib.dump(le_class, f"{ARTIFACTS_DIR}/le_class.joblib")
    joblib.dump(le_lang, f"{ARTIFACTS_DIR}/le_lang.joblib")
    joblib.dump(le_weak, f"{ARTIFACTS_DIR}/le_weak.joblib")
    joblib.dump(le_rec, f"{ARTIFACTS_DIR}/le_rec.joblib")

    # 3. Learning Profiles Clustering (KMeans)
    # Cluster students into 3 groups based on quiz, assessment, and progress
    print("Training Student Profile Clusterer (KMeans)...")
    clusterer = KMeans(n_clusters=3, random_state=42)
    clusterer.fit(X_perf)
    joblib.dump(clusterer, f"{ARTIFACTS_DIR}/student_clusterer.joblib")

    print(f"All ML Models successfully trained and saved to {ARTIFACTS_DIR}")

if __name__ == "__main__":
    train_and_save_models()
