# bias_detector.py
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np

class PoliticalBiasDetector:
    def __init__(self, model_name="detoxify/roberta-base-political-bias"):
        # Load the model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.model.eval()  # Set model to evaluation mode
        
    def analyze_text(self, text):
        """
        Analyze the political bias of the given text.
        
        Args:
            text (str): The news article or text to analyze
            
        Returns:
            dict: A dictionary with bias scores and classification
        """
        # Tokenize the input text
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512, padding=True)
        
        # Pass through the model
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=-1)[0]
        
        # Get the label mapping
        labels = ["left", "right"]
        
        # Convert to dictionary with scores
        scores = {label: float(prob) for label, prob in zip(labels, probabilities)}
        
        # Determine the bias direction and strength
        if scores["left"] > scores["right"]:
            bias = "left-leaning"
            strength = scores["left"]
        else:
            bias = "right-leaning"
            strength = scores["right"]
            
        # Categorize bias strength
        if strength > 0.9:
            strength_label = "strong"
        elif strength > 0.7:
            strength_label = "moderate"
        else:
            strength_label = "slight"
        
        # Return the result
        return {
            "raw_scores": scores,
            "bias_direction": bias,
            "bias_strength": strength_label,
            "confidence": float(max(probabilities))
        }