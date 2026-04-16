from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle

from intent_data import intent_samples

texts = []
labels = []

for intent, examples in intent_samples.items():
    for example in examples:
        texts.append(example)
        labels.append(intent)

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

model = LogisticRegression()
model.fit(X, labels)

with open("intent_model.pkl", "wb") as f:
    pickle.dump((vectorizer, model), f)

print("Intent model trained")
