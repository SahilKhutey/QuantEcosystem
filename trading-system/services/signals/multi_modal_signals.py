import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model
import logging
from datetime import datetime

logger = logging.getLogger('MultiModalSignals')

class MultiModalSignalGenerator:
    """
    Advanced signal generator that combines multiple data modalities using attention mechanisms.
    """
    
    def __init__(self, input_shapes: dict, output_size: int = 1):
        """
        Initialize multi-modal signal generator.
        
        Args:
            input_shapes (dict): Dictionary of input shapes for each modality
            output_size (int): Size of output (1 for binary signals, 2 for probability)
        """
        self.input_shapes = input_shapes
        self.output_size = output_size
        self.model = None
        self.last_update = datetime.now()
        self.performance = {
            'accuracy': 0.0,
            'sharpe_ratio': 0.0,
            'win_rate': 0.0,
            'last_update': datetime.now()
        }
    
    def build_model(self):
        """Build multi-modal model with attention mechanism"""
        # Input layers for each modality
        inputs = {}
        for modality, shape in self.input_shapes.items():
            inputs[modality] = layers.Input(shape=shape, name=f"{modality}_input")
        
        # Feature extraction for each modality
        features = {}
        for modality in inputs:
            if modality == 'price':
                # Price time series processing
                x = layers.Conv1D(32, 3, activation='relu')(inputs[modality])
                x = layers.MaxPooling1D(2)(x)
                x = layers.Conv1D(64, 3, activation='relu')(x)
                x = layers.MaxPooling1D(2)(x)
                x = layers.Flatten()(x)
                features[modality] = x
            elif modality == 'news':
                # News processing
                x = layers.LSTM(64, return_sequences=True)(inputs[modality])
                x = layers.Attention()([x, x])
                x = layers.GlobalMaxPooling1D()(x)
                features[modality] = x
            elif modality == 'order_flow':
                # Order flow processing
                x = layers.LSTM(64, return_sequences=True)(inputs[modality])
                x = layers.Dense(32, activation='relu')(x)
                x = layers.Flatten()(x)
                features[modality] = x
            elif modality == 'technical':
                # Technical indicator processing
                x = layers.Dense(64, activation='relu')(inputs[modality])
                x = layers.Dense(32, activation='relu')(x)
                features[modality] = x
            elif modality == 'sentiment':
                # Sentiment processing
                x = layers.Dense(32, activation='relu')(inputs[modality])
                features[modality] = x
            else:
                # Default processing
                x = layers.Flatten()(inputs[modality])
                x = layers.Dense(64, activation='relu')(x)
                features[modality] = x
        
        # Attention mechanism across modalities
        feature_list = []
        for feature in features.values():
            # Ensure all features have the same dimension for attention or just concatenate
            feature_list.append(layers.Dense(64, activation='relu')(feature))
        
        # Multi-head attention (simplified across modalities)
        if len(feature_list) > 1:
            # Stack features: (Batch, NumModalities, 64)
            stacked = layers.Lambda(lambda x: tf.stack(x, axis=1))(feature_list)
            
            # Cross-modality Attention
            attention = layers.MultiHeadAttention(num_heads=4, key_dim=16)(stacked, stacked)
            
            # Combine
            output = layers.GlobalAveragePooling1D()(attention)
        else:
            output = feature_list[0]
        
        # Classification head
        output = layers.Dense(64, activation='relu')(output)
        output = layers.Dropout(0.2)(output)
        output = layers.Dense(self.output_size, activation='sigmoid' if self.output_size == 1 else 'softmax')(output)
        
        # Create model
        self.model = Model(inputs=inputs, outputs=output)
        
        # Compile model
        self.model.compile(
            optimizer='adam',
            loss='binary_crossentropy' if self.output_size == 1 else 'categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.last_update = datetime.now()
        logger.info("Multi-modal signal generator model built")
        return self.model
    
    def train(self, data, labels, epochs=50, batch_size=32, validation_split=0.2):
        """
        Train the multi-modal model.
        """
        if not self.model:
            self.build_model()
        
        try:
            history = self.model.fit(
                data,
                labels,
                epochs=epochs,
                batch_size=batch_size,
                validation_split=validation_split,
                verbose=1
            )
            
            # Update performance metrics
            if len(history.history['val_accuracy']) > 0:
                self.performance['accuracy'] = history.history['val_accuracy'][-1]
                self.performance['last_update'] = datetime.now()
            
            return history
        except Exception as e:
            logger.exception("Error training multi-modal model")
            raise
    
    def generate_signal(self, data):
        """
        Generate trading signal from multi-modal data.
        """
        if not self.model:
            self.build_model()
        
        try:
            # Generate prediction
            prediction = self.model.predict(data, verbose=0)
            
            # Process prediction based on output type
            if self.output_size == 1:
                # Binary signal (0 or 1)
                signal = 1 if prediction[0][0] > 0.5 else 0
                confidence = prediction[0][0] if signal == 1 else 1 - prediction[0][0]
            else:
                # Multi-class signal (probabilities)
                signal = np.argmax(prediction[0])
                confidence = np.max(prediction[0])
            
            return {
                'signal': signal,
                'confidence': float(confidence),
                'probabilities': [float(p) for p in prediction[0]],
                'timestamp': datetime.now()
            }
        except Exception as e:
            logger.exception("Error generating signal")
            return {
                'signal': 0,
                'confidence': 0.0,
                'probabilities': [0.0] * self.output_size,
                'timestamp': datetime.now()
            }
    
    def evaluate_performance(self, X_test, y_test):
        """Evaluate model performance on test data"""
        if not self.model:
            return None
        
        results = self.model.evaluate(X_test, y_test, verbose=0)
        
        # Update performance metrics
        self.performance = {
            'accuracy': results[1] if len(results) > 1 else 0.0,
            'loss': results[0],
            'win_rate': 0.0,
            'last_update': datetime.now()
        }
        
        return self.performance
    
    def get_model_summary(self):
        """Get model summary as string"""
        if not self.model:
            return "Model not built"
        
        from io import StringIO
        import sys
        
        old_stdout = sys.stdout
        sys.stdout = StringIO()
        
        try:
            self.model.summary()
            summary = sys.stdout.getvalue()
        finally:
            sys.stdout = old_stdout
        
        return summary
    
    def get_performance_metrics(self):
        """Get current performance metrics"""
        return {
            **self.performance,
            'model_built': self.model is not None
        }
