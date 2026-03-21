from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import List, Dict

class FinancialSentimentAnalyzer:
    def __init__(self):
        # Load FinBERT model
        self.tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
        self.model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
        
    def analyze_sentiment(self, texts: List[str]) -> List[Dict]:
        """Analyze financial sentiment using FinBERT"""
        results = []
        
        for text in texts:
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                
            # Get confidence scores
            positive = predictions[0][0].item()
            negative = predictions[0][1].item()
            neutral = predictions[0][2].item()
            
            sentiment = max([(positive, 'bullish'), (negative, 'bearish'), (neutral, 'neutral')], 
                          key=lambda x: x[0])
            
            results.append({
                'text': text,
                'sentiment': sentiment[1],
                'confidence': sentiment[0],
                'scores': {
                    'bullish': positive,
                    'bearish': negative,
                    'neutral': neutral
                }
            })
            
        return results
