import pickle

with open("ml/intent_model.pkl", "rb") as f:
    vectorizer, model = pickle.load(f)

def predict_intent(query: str):
    X = vectorizer.transform([query])
    intent = model.predict(X)[0]
    return intent
