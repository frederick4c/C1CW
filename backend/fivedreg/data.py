import pickle
import numpy as np
import os

def load_dataset(filepath):
    """
    Loads the dataset from a pickle file.
    
    Args:
        filepath (str): Path to the .pkl file.
        
    Returns:
        tuple: (X, y) where X is the feature matrix and y is the target vector.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")
        
    with open(filepath, 'rb') as f:
        data = pickle.load(f)
        
    if not isinstance(data, dict) or 'X' not in data or 'y' not in data:
        raise ValueError("Dataset must be a dictionary containing 'X' and 'y' keys.")
        
    X = data['X']
    y = data['y']
    
    # Validate dimensions
    if X.ndim != 2 or X.shape[1] != 5:
        raise ValueError(f"X must be a 2D array with 5 features. Got shape {X.shape}")
        
    if y.ndim != 1:
        raise ValueError(f"y must be a 1D array. Got shape {y.shape}")
        
    if X.shape[0] != y.shape[0]:
        raise ValueError(f"X and y must have the same number of samples. Got X:{X.shape[0]}, y:{y.shape[0]}")
        
    # Handle missing values (NaNs)
    # Check for NaNs in X or y
    nan_mask_X = np.isnan(X).any(axis=1)
    nan_mask_y = np.isnan(y)
    nan_mask = nan_mask_X | nan_mask_y
    
    if np.any(nan_mask):
        print(f"Warning: Found {np.sum(nan_mask)} rows with missing values. Dropping them.")
        X = X[~nan_mask]
        y = y[~nan_mask]
        
    return X, y

def split_data(X, y, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15, seed=42):
    """
    Splits the data into training, validation, and test sets.
    
    Args:
        X (np.ndarray): Feature matrix.
        y (np.ndarray): Target vector.
        train_ratio (float): Proportion of data for training.
        val_ratio (float): Proportion of data for validation.
        test_ratio (float): Proportion of data for testing.
        seed (int): Random seed for reproducibility.
        
    Returns:
        tuple: (X_train, y_train, X_val, y_val, X_test, y_test)
    """
    if not np.isclose(train_ratio + val_ratio + test_ratio, 1.0):
        raise ValueError("Split ratios must sum to 1.0")
        
    np.random.seed(seed)
    indices = np.arange(X.shape[0])
    np.random.shuffle(indices)
    
    X = X[indices]
    y = y[indices]
    
    n_samples = X.shape[0]
    n_train = int(n_samples * train_ratio)
    n_val = int(n_samples * val_ratio)
    
    X_train = X[:n_train]
    y_train = y[:n_train]
    
    X_val = X[n_train:n_train + n_val]
    y_val = y[n_train:n_train + n_val]
    
    X_test = X[n_train + n_val:]
    y_test = y[n_train + n_val:]
    
    return X_train, y_train, X_val, y_val, X_test, y_test

import json

class Scaler:
    def __init__(self):
        self.mean = None
        self.std = None
        
    def fit(self, X):
        """
        Computes the mean and std to be used for later scaling.
        """
        self.mean = np.mean(X, axis=0)
        self.std = np.std(X, axis=0)
        # Avoid division by zero
        self.std[self.std == 0] = 1.0
        
    def transform(self, X):
        """
        Performs standardization by centering and scaling.
        """
        if self.mean is None or self.std is None:
            raise ValueError("Scaler has not been fitted yet.")
        return (X - self.mean) / self.std
    
    def fit_transform(self, X):
        """
        Fits to data, then transforms it.
        """
        self.fit(X)
        return self.transform(X)
        
    def save(self, filepath):
        """
        Saves the scaler parameters to a JSON file.
        """
        if self.mean is None or self.std is None:
            raise ValueError("Scaler has not been fitted yet.")
            
        data = {
            "mean": self.mean.tolist(),
            "std": self.std.tolist()
        }
        with open(filepath, 'w') as f:
            json.dump(data, f)
            
    def load(self, filepath):
        """
        Loads scaler parameters from a JSON file.
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")
            
        with open(filepath, 'r') as f:
            data = json.load(f)
            
        self.mean = np.array(data["mean"])
        self.std = np.array(data["std"])

def standardize_data(X_train, X_val, X_test, save_path="scaler_params.json"):
    """
    Standardizes the data using the mean and standard deviation of the training set.
    Also saves the scaler parameters.
    
    Args:
        X_train (np.ndarray): Training features.
        X_val (np.ndarray): Validation features.
        X_test (np.ndarray): Test features.
        save_path (str): Path to save the scaler parameters.
        
    Returns:
        tuple: (X_train_scaled, X_val_scaled, X_test_scaled)
    """
    scaler = Scaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    if save_path:
        scaler.save(save_path)
    else:
        # Optional: handle case where save_path is None if needed, or just pass
        pass
        
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    return X_train_scaled, X_val_scaled, X_test_scaled

