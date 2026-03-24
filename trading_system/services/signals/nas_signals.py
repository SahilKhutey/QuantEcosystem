import numpy as np
import logging
import tensorflow as tf
from tensorflow.keras import layers, Model
import random
from datetime import datetime

logger = logging.getLogger('NASignals')

class NeuralArchitectureSearch:
    """
    Advanced signal generator using Neural Architecture Search to automatically
    discover optimal neural network architectures for signal generation.
    """
    
    def __init__(self, input_shape: tuple, num_classes: int = 2, population_size: int = 20):
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.population_size = population_size
        self.population = []
        self.best_architecture = None
        self.best_fitness = -float('inf')
        self.generation = 0
        self.last_update = datetime.now()
        self.mutation_rate = 0.2
        self.crossover_rate = 0.7
        self.performance_history = []
    
    def _create_random_architecture(self):
        """Create a random neural network architecture"""
        # Define possible operations
        operations = [
            'conv1d', 'conv2d', 'lstm', 'gru', 'dense', 'max_pooling', 'attention'
        ]
        
        # Create random architecture
        architecture = []
        num_layers = random.randint(3, 6)
        
        for i in range(num_layers):
            layer_type = random.choice(operations)
            
            if layer_type in ['conv1d', 'conv2d']:
                filters = random.choice([16, 32, 64, 128])
                kernel_size = random.choice([3, 5, 7])
                activation = random.choice(['relu', 'leaky_relu', 'tanh'])
                architecture.append({
                    'type': layer_type,
                    'filters': filters,
                    'kernel_size': kernel_size,
                    'activation': activation,
                    'name': f'layer_{i}'
                })
            elif layer_type in ['lstm', 'gru']:
                units = random.choice([32, 64, 128])
                return_sequences = i < num_layers - 2
                architecture.append({
                    'type': layer_type,
                    'units': units,
                    'return_sequences': return_sequences,
                    'name': f'layer_{i}'
                })
            elif layer_type == 'dense':
                units = random.choice([16, 32, 64])
                activation = random.choice(['relu', 'softmax', 'linear'])
                architecture.append({
                    'type': layer_type,
                    'units': units,
                    'activation': activation,
                    'name': f'layer_{i}'
                })
            elif layer_type == 'max_pooling':
                pool_size = random.choice([2, 3])
                architecture.append({
                    'type': layer_type,
                    'pool_size': pool_size,
                    'name': f'layer_{i}'
                })
            elif layer_type == 'attention':
                architecture.append({
                    'type': layer_type,
                    'name': f'layer_{i}',
                    'factors': random.uniform(0.5, 1.5)
                })
        
        return architecture
    
    def _build_model(self, architecture):
        """Build a Keras model from architecture definition"""
        inputs = tf.keras.Input(shape=self.input_shape)
        x = inputs
        
        # Build model from architecture
        for layer in architecture:
            if layer['type'] == 'conv1d':
                x = layers.Conv1D(
                    filters=layer['filters'],
                    kernel_size=layer['kernel_size'],
                    activation=layer['activation'],
                    name=layer['name']
                )(x)
            elif layer['type'] == 'conv2d':
                x = layers.Conv2D(
                    filters=layer['filters'],
                    kernel_size=layer['kernel_size'],
                    activation=layer['activation'],
                    name=layer['name']
                )(x)
            elif layer['type'] == 'lstm':
                x = layers.LSTM(
                    units=layer['units'],
                    return_sequences=layer['return_sequences'],
                    name=layer['name']
                )(x)
            elif layer['type'] == 'gru':
                x = layers.GRU(
                    units=layer['units'],
                    return_sequences=layer['return_sequences'],
                    name=layer['name']
                )(x)
            elif layer['type'] == 'dense':
                x = layers.Dense(
                    units=layer['units'],
                    activation=layer['activation'],
                    name=layer['name']
                )(x)
            elif layer['type'] == 'max_pooling':
                if len(x.shape) == 3:  # For 1D data
                    x = layers.MaxPooling1D(
                        pool_size=layer['pool_size'],
                        name=layer['name']
                    )(x)
                else:  # For 2D data
                    x = layers.MaxPooling2D(
                        pool_size=layer['pool_size'],
                        name=layer['name']
                    )(x)
            elif layer['type'] == 'attention':
                # Simple attention mechanism
                attention = layers.Dense(1, activation='tanh')(x)
                attention = layers.Flatten()(attention)
                attention = layers.Activation('softmax')(attention)
                attention = layers.RepeatVector(x.shape[-1])(attention)
                attention = layers.Permute([2, 1])(attention)
                x = layers.Multiply()([x, attention])
                x = layers.Lambda(lambda x: tf.keras.backend.sum(x, axis=1))(x)
        
        # Output layer
        outputs = layers.Dense(self.num_classes, activation='softmax', name='output')(x)
        
        # Create model
        model = Model(inputs=inputs, outputs=outputs)
        
        # Compile model
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def _evaluate_architecture(self, model, X_train, y_train, X_val, y_val, epochs=10):
        """Evaluate architecture performance"""
        try:
            # Train model
            history = model.fit(
                X_train, y_train,
                validation_data=(X_val, y_val),
                epochs=epochs,
                batch_size=32,
                verbose=0
            )
            
            # Calculate fitness (validation accuracy)
            val_acc = history.history['val_accuracy'][-1]
            
            # Add regularization penalty for complexity
            complexity_penalty = 0.05 * len(model.layers)
            fitness = val_acc - complexity_penalty
            
            return {
                'fitness': fitness,
                'val_acc': val_acc,
                'complexity_penalty': complexity_penalty,
                'model': model
            }
        except Exception as e:
            logger.error(f"Error evaluating architecture: {str(e)}")
            return {'fitness': -0.1, 'val_acc': 0, 'complexity_penalty': 0, 'model': None}
    
    def initialize_population(self):
        """Initialize population with random architectures"""
        self.population = []
        for _ in range(self.population_size):
            arch = self._create_random_architecture()
            self.population.append({
                'architecture': arch,
                'fitness': -float('inf'),
                'history': []
            })
        self.generation = 0
        logger.info(f"Initialized NAS population with {self.population_size} architectures")
    
    def evolve(self, X_train, y_train, X_val, y_val, generations=10):
        """Evolve population to find best architecture"""
        if not self.population:
            self.initialize_population()
        
        for gen in range(generations):
            logger.info(f"Starting generation {self.generation+1}/{generations}")
            
            # Evaluate all architectures
            for i, individual in enumerate(self.population):
                # Build and evaluate model
                model = self._build_model(individual['architecture'])
                evaluation = self._evaluate_architecture(
                    model, X_train, y_train, X_val, y_val
                )
                
                # Update individual
                individual['fitness'] = evaluation['fitness']
                individual['val_acc'] = evaluation['val_acc']
                individual['complexity_penalty'] = evaluation['complexity_penalty']
                individual['model'] = evaluation['model']
                individual['history'].append({
                    'generation': self.generation,
                    'fitness': evaluation['fitness'],
                    'val_acc': evaluation['val_acc'],
                    'complexity_penalty': evaluation['complexity_penalty']
                })
            
            # Sort population by fitness
            self.population.sort(key=lambda x: x['fitness'], reverse=True)
            
            # Update best architecture
            if self.population[0]['fitness'] > self.best_fitness:
                self.best_fitness = self.population[0]['fitness']
                self.best_architecture = self.population[0]['architecture']
                logger.info(f"New best architecture found: fitness={self.best_fitness:.4f}, "
                           f"val_acc={self.population[0]['val_acc']:.4f}")
            
            # Track performance history
            self.performance_history.append({
                'generation': self.generation,
                'best_fitness': self.best_fitness,
                'avg_fitness': np.mean([ind['fitness'] for ind in self.population])
            })
            
            # Selection: keep top 50% as parents
            num_parents = self.population_size // 2
            parents = self.population[:num_parents]
            
            # Create new population through crossover and mutation
            new_population = []
            for i in range(self.population_size):
                # Selection
                parent1 = random.choice(parents)
                parent2 = random.choice(parents) if len(parents) > 1 else parent1
                
                # Crossover
                if random.random() < self.crossover_rate:
                    child_arch = self._crossover(parent1['architecture'], parent2['architecture'])
                else:
                    child_arch = parent1['architecture'].copy()
                
                # Mutation
                if random.random() < self.mutation_rate:
                    child_arch = self._mutate(child_arch)
                
                # Add to new population
                new_population.append({
                    'architecture': child_arch,
                    'fitness': -float('inf'),
                    'history': []
                })
            
            # Replace old population
            self.population = new_population
            self.generation += 1
            self.last_update = datetime.now()
        
        # Return best architecture
        return self.best_architecture
    
    def _crossover(self, arch1, arch2):
        """Perform crossover between two architectures"""
        # Simple point crossover
        min_len = min(len(arch1), len(arch2))
        crossover_point = random.randint(1, min_len - 1)
        
        # Create child by combining parts of both parents
        child = arch1[:crossover_point] + arch2[crossover_point:]
        
        return child
    
    def _mutate(self, architecture):
        """Mutate an architecture by changing one layer"""
        if not architecture:
            return architecture
        
        # Select a random layer to mutate
        idx = random.randint(0, len(architecture) - 1)
        layer = architecture[idx].copy()
        
        # Random mutation
        mutation_type = random.choice(['type', 'params'])
        
        if mutation_type == 'type':
            # Change layer type
            layer['type'] = random.choice([
                'conv1d', 'conv2d', 'lstm', 'gru', 'dense', 
                'max_pooling', 'attention'
            ])
        else:
            # Change layer parameters
            if layer['type'] in ['conv1d', 'conv2d']:
                layer['filters'] = random.choice([16, 32, 64, 128])
                layer['kernel_size'] = random.choice([3, 5, 7])
            elif layer['type'] in ['lstm', 'gru']:
                layer['units'] = random.choice([32, 64, 128])
            elif layer['type'] == 'dense':
                layer['units'] = random.choice([16, 32, 64])
        
        # Create new architecture
        new_arch = architecture.copy()
        new_arch[idx] = layer
        
        return new_arch
    
    def get_best_architecture(self):
        """Get the best architecture found so far"""
        if self.best_architecture:
            return {
                'architecture': self.best_architecture,
                'fitness': self.best_fitness,
                'last_update': self.last_update
            }
        return None
    
    def get_performance_history(self):
        """Get historical performance of the NAS process"""
        return self.performance_history
