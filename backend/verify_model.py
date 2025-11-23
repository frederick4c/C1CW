import os
import sys
import time
import numpy as np
import pickle

# Add backend to path to import fivedreg
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.fivedreg.data import split_data, standardize_data
from backend.fivedreg.model import FiveDNet

def verify_model():
    print("Loading dataset...")
    file_path = 'coursework_dataset.pkl'
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, 'rb') as f:
        data = pickle.load(f)
        X = data['X']
        y = data['y']

    # Handle NaNs if any (simple drop for verification)
    nan_mask = np.isnan(X).any(axis=1) | np.isnan(y)
    X = X[~nan_mask]
    y = y[~nan_mask]

    print(f"Dataset shape: X={X.shape}, y={y.shape}")

    # Split and standardize
    X_train, y_train, X_val, y_val, X_test, y_test = split_data(X, y)
    X_train_scaled, X_val_scaled, X_test_scaled = standardize_data(X_train, X_val, X_test)

    print("Initializing model...")
    model = FiveDNet(hidden_layers=[64, 32, 16], max_epochs=50, verbose=0)

    print("Training model...")
    start_time = time.time()
    history = model.fit(X_train_scaled, y_train, validation_split=0.2)
    end_time = time.time()
    duration = end_time - start_time

    print(f"Training completed in {duration:.2f} seconds.")

    if duration > 60:
        print("WARNING: Training took longer than 60 seconds!")
    else:
        print("Performance check passed (< 60s).")

    print("Evaluating on test set...")
    predictions = model.predict(X_test_scaled)
    mse = np.mean((predictions - y_test) ** 2)
    print(f"Test MSE: {mse:.4f}")

    if mse > 1.0: # Arbitrary threshold, adjust based on data scale
         print("WARNING: MSE seems high. Check model performance.")
    else:
         print("Model performance seems reasonable.")

if __name__ == "__main__":
    verify_model()
