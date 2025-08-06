from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timezone
import csv
import io
import requests
import json
import re
from textblob import TextBlob

app = Flask(__name__)
CORS(app)

# --- MongoDB setup ---
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
try:
    db = client["feelscope"]
    analyses_collection = db["analyses"]
    print("MongoDB connection successful")
except Exception as e:
    print("MongoDB connection failed:", e)

# --- Route: Analyze (AI with Ollama) ---
@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.json
    text = data.get("text")
    source = data.get("source", "manual")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        ollama_response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
"prompt": f"""
You are a sentiment, emotion, and topic classifier.
Classify this text:
\"{text}\"

Return only a valid JSON object like this — without comments or explanations:
{{
  "sentiment": "Positive | Neutral | Negative",
  "emotion": ["..."], 
  "topic": "..."
}}
"""
            }
        )

        # Nettoyage des lignes et reconstruction du texte
        lines = ollama_response.text.strip().splitlines()
        responses = []
        for line in lines:
            try:
                parsed_line = json.loads(line.replace("data: ", ""))
                if 'response' in parsed_line:
                    responses.append(parsed_line['response'])
            except Exception:
                continue

        full_response = "".join(responses)
        print("Full Ollama response text:", full_response)

        # Extraire le vrai JSON proprement
        match = re.search(r"\{.*\}", full_response, re.DOTALL)
        if not match:
            raise ValueError("No valid JSON object found")

        parsed = json.loads(match.group())

    except Exception as e:
        print(" Failed to parse Ollama response:", e)
        return jsonify({"error": "Invalid JSON from Ollama", "details": str(e)}), 500

    analysis = {
        "text": text,
        "sentiment": parsed.get("sentiment", "unknown"),
        "emotion": parsed.get("emotion", "unknown"),
        "topic": parsed.get("topic", "unknown"),
        "timestamp": datetime.now(timezone.utc),
        "source": source
    }

    analyses_collection.insert_one(analysis)
    analysis['_id'] = str(analysis['_id'])
    return jsonify(analysis)

# --- Route: Analyze Basic ---
@app.route('/analyze-basic', methods=['POST'])
def analyze_basic():
    data = request.json
    text = data.get("text")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    sentiment = "neutral"
    if "love" in text.lower():
        sentiment = "positive"
    elif "hate" in text.lower():
        sentiment = "negative"

    analysis = {
        "text": text,
        "sentiment": sentiment,
        "emotion": "unsure",
        "topic": "general",
        "timestamp": datetime.now(timezone.utc),
        "source": "basic"
    }

    analyses_collection.insert_one(analysis)
    analysis['_id'] = str(analysis['_id'])
    return jsonify(analysis)

# --- Route: Get history ---
@app.route('/history', methods=['GET'])
def get_history():
    results = list(analyses_collection.find().sort("timestamp", -1))
    for r in results:
        r["_id"] = str(r["_id"])
    return jsonify(results)

# --- Route: Delete history ---
@app.route('/history', methods=['DELETE'])
def clear_history():
    analyses_collection.delete_many({})
    return jsonify({"message": "History cleared"}), 200

# --- Route: Export CSV ---
@app.route('/export', methods=['GET'])
def export_csv():
    results = list(analyses_collection.find().sort("timestamp", -1))
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Text", "Sentiment", "Emotion", "Topic", "Timestamp", "Source"])
    for doc in results:
        writer.writerow([
            doc.get("text", ""),
            doc.get("sentiment", ""),
            str(doc.get("emotion", "")),
            doc.get("topic", ""),
            doc.get("timestamp", "").strftime('%Y-%m-%d %H:%M:%S') if doc.get("timestamp") else "",
            doc.get("source", "")
        ])

    response = app.response_class(
        response=output.getvalue(),
        mimetype='text/csv',
        headers={"Content-Disposition": "attachment;filename=export.csv"}
    )
    return response

# --- Route: Chart data ---
@app.route('/chart-data', methods=['GET'])
def chart_data():
    source_filter = request.args.get("source", None)
    query = {"source": source_filter} if source_filter else {}
    docs = analyses_collection.find(query)

    sentiment_counts = {}
    emotion_counts = {}

    for d in docs:
        sentiment = d.get("sentiment", "unknown")
        emotion = d.get("emotion", "unknown")

        sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1

        if isinstance(emotion, list):
            for e in emotion:
                emotion_counts[e] = emotion_counts.get(e, 0) + 1
        else:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

    sentiment_list = [{"name": k, "count": v} for k, v in sentiment_counts.items()]
    emotion_list = [{"name": k, "count": v} for k, v in emotion_counts.items()]

    return jsonify({
        "sentiments": sentiment_list,
        "emotions": emotion_list
    })
    # --- Route: Reddit search ---
@app.route('/reddit-search', methods=['GET'])
def reddit_search():
    subreddit = request.args.get('subreddit')
    if not subreddit:
        return jsonify({"error": "Subreddit is required"}), 400

    try:
        reddit_url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit=10"
        headers = {"User-agent": "FeelScopeBot/0.1"}
        response = requests.get(reddit_url, headers=headers)
        response.raise_for_status()

        data = response.json()
        posts = [child["data"]["title"] for child in data["data"]["children"]]

        return jsonify({"posts": posts})
    except Exception as e:
        print("Reddit fetch error:", e)
        return jsonify({"error": "Failed to fetch subreddit"}), 500
    from textblob import TextBlob

@app.route('/reddit-textblob', methods=['POST'])
def reddit_textblob():
    data = request.json
    text = data.get("text")
    source = data.get("source", "reddit")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity

    sentiment = "neutral"
    if polarity > 0.1:
        sentiment = "positive"
    elif polarity < -0.1:
        sentiment = "negative"

    analysis = {
        "text": text,
        "sentiment": sentiment,
        "emotion": "unsure",
        "topic": "reddit",
        "timestamp": datetime.now(timezone.utc),
        "source": source
    }

    analyses_collection.insert_one(analysis)
    analysis["_id"] = str(analysis["_id"])
    return jsonify(analysis)

@app.route('/reddit-analyze', methods=['POST'])
def reddit_ai_analyze():
    data = request.json
    text = data.get("text")
    source = data.get("source", "reddit-ai")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        ollama_response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": f"""
You are a sentiment, emotion, and topic classifier.
Analyze this Reddit post:
\"{text}\"

Return a valid JSON ONLY like this:
{{
  "sentiment": "Positive | Neutral | Negative",
  "emotion": ["..."], 
  "topic": "..."
}}
"""
            }
        )

        # Reconstruction de la réponse
        lines = ollama_response.text.strip().splitlines()
        responses = []
        for line in lines:
            try:
                parsed_line = json.loads(line.replace("data: ", ""))
                if 'response' in parsed_line:
                    responses.append(parsed_line['response'])
            except Exception:
                continue

        full_response = "".join(responses)
        print("📤 Full Ollama Reddit response:", full_response)

        match = re.search(r"\{.*\}", full_response, re.DOTALL)
        if not match:
            raise ValueError("No valid JSON object found")

        parsed = json.loads(match.group())

    except Exception as e:
        print("Failed to parse Reddit AI response:", e)
        return jsonify({"error": "Invalid JSON from Ollama", "details": str(e)}), 500

    analysis = {
        "text": text,
        "sentiment": parsed.get("sentiment", "unknown"),
        "emotion": parsed.get("emotion", "unknown"),
        "topic": parsed.get("topic", "unknown"),
        "timestamp": datetime.now(timezone.utc),
        "source": source
    }

    analyses_collection.insert_one(analysis)
    analysis["_id"] = str(analysis["_id"])
    return jsonify(analysis)

# --- Route: Save analysis from Gemini or other sources ---
@app.route('/save-analysis', methods=['POST'])
def save_analysis():
    data = request.json
    analysis = {
        "text": data.get("text"),
        "sentiment": data.get("sentiment"),
        "emotion": data.get("emotion"),
        "topic": data.get("topic"),
        "timestamp": datetime.now(timezone.utc),
        "source": data.get("source", "gemini")
    }
    analyses_collection.insert_one(analysis)
    analysis['_id'] = str(analysis['_id'])
    return jsonify(analysis)

# --- Run App ---
if __name__ == "__main__":
    app.run(debug=True)
