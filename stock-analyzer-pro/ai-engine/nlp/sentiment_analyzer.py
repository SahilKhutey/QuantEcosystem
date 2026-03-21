from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import List, Dict
import numpy as np

class FinancialSentimentAnalyzer:
    def __init__(self):
        # Use a pre-trained financial sentiment model
        self.model_name = "mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
        
        # Fallback to general sentiment analysis
        self.fallback_pipeline = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
    
    def analyze_sentiment(self, texts: List[str]) -> List[Dict]:
        """Analyze sentiment for multiple texts"""
        results = []
        
        for text in texts:
            if not text or len(text.strip()) < 10:  # Skip very short texts
                results.append({
                    "text": text,
                    "sentiment": "neutral",
                    "confidence": 0.5,
                    "model": "skip"
                })
                continue
            
            try:
                # Try financial model first
                result = self._analyze_with_financial_model(text)
                results.append(result)
            except Exception as e:
                # Fallback to general model
                print(f"Error in financial model, using fallback: {e}")
                result = self._analyze_with_fallback(text)
                results.append(result)
        
        return results
    
    def _analyze_with_financial_model(self, text: str) -> Dict:
        """Analyze using financial-specific model"""
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        # Map model outputs to sentiments
        labels = ["negative", "neutral", "positive"]
        scores = predictions[0].numpy()
        max_index = np.argmax(scores)
        
        return {
            "text": text,
            "sentiment": labels[max_index],
            "confidence": float(scores[max_index]),
            "scores": {label: float(score) for label, score in zip(labels, scores)},
            "model": "financial"
        }
    
    def _analyze_with_fallback(self, text: str) -> Dict:
        """Fallback sentiment analysis"""
        result = self.fallback_pipeline(text)[0]
        
        # Map to our sentiment labels
        sentiment_map = {
            "NEGATIVE": "negative",
            "POSITIVE": "positive"
        }
        
        return {
            "text": text,
            "sentiment": sentiment_map.get(result['label'], 'neutral'),
            "confidence": float(result['score']),
            "model": "general"
        }
