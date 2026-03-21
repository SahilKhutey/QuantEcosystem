from transformers import pipeline

class NLPSentiment:
    """
    Sentiment analysis engine for processing news and social media feeds.
    """
    def __init__(self):
        # Using a model pre-trained on financial text for better accuracy
        self.sentiment_analyzer = pipeline("sentiment-analysis", model="ProsusAI/finbert")

    def analyze_news(self, text_list):
        """Analyzes sentiment for a list of news headlines or snippets."""
        return self.sentiment_analyzer(text_list)

    def calculate_sentiment_score(self, sentiment_results):
        """Aggregates sentiment results into a single numerical score."""
        scores = []
        for res in sentiment_results:
            score = res['score'] if res['label'] == 'positive' else -res['score']
            if res['label'] == 'neutral': score = 0
            scores.append(score)
        return sum(scores) / len(scores) if scores else 0
