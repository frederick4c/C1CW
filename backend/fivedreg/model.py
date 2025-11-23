import tensorflow as tf
import numpy as np
import os

class FiveDNet:
    def __init__(self, hidden_layers=[64, 32, 16], learning_rate=0.001, max_epochs=100, batch_size=32, verbose=1):
        """
        Initialize the FiveDNet model.
        
        Args:
            hidden_layers (list): List of integers specifying the number of neurons in each hidden layer.
            learning_rate (float): Learning rate for the optimizer.
            max_epochs (int): Maximum number of training epochs.
            batch_size (int): Batch size for training.
            verbose (int): Verbosity mode. 0 = silent, 1 = progress bar, 2 = one line per epoch.
        """
        self.hidden_layers = hidden_layers
        self.learning_rate = learning_rate
        self.max_epochs = max_epochs
        self.batch_size = batch_size
        self.verbose = verbose
        self.model = None
        
    def _build_model(self, input_shape):
        """
        Builds the TensorFlow model.
        """
        model = tf.keras.Sequential()
        model.add(tf.keras.layers.Input(shape=(input_shape,)))
        
        for units in self.hidden_layers:
            model.add(tf.keras.layers.Dense(units, activation='relu'))
            
        model.add(tf.keras.layers.Dense(1, activation='linear'))
        
        optimizer = tf.keras.optimizers.Adam(learning_rate=self.learning_rate)
        model.compile(optimizer=optimizer, loss='mse', metrics=['mae'])
        return model

    def fit(self, X, y, validation_split=0.2):
        """
        Trains the model on the provided data.
        
        Args:
            X (np.ndarray): Feature matrix.
            y (np.ndarray): Target vector.
            validation_split (float): Fraction of data to use for validation.
            
        Returns:
            history: Training history.
        """
        if self.model is None:
            self._build_model(X.shape[1])
            self.model = self._build_model(X.shape[1])
            
        # Early stopping to prevent overfitting and save time
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        history = self.model.fit(
            X, y,
            epochs=self.max_epochs,
            batch_size=self.batch_size,
            validation_split=validation_split,
            callbacks=[early_stopping],
            verbose=self.verbose
        )
        
        return history

    def predict(self, X):
        """
        Generates predictions for the input samples.
        
        Args:
            X (np.ndarray): Feature matrix.
            
        Returns:
            np.ndarray: Predicted values.
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet.")
            
        return self.model.predict(X, verbose=1).flatten()
    
    def save(self, filepath):
        """
        Saves the model to the specified filepath.
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet.")
        self.model.save(filepath)
        
    def load(self, filepath):
        """
        Loads the model from the specified filepath.
        """
        if not os.path.exists(filepath):
             raise FileNotFoundError(f"File not found: {filepath}")
        self.model = tf.keras.models.load_model(filepath)
