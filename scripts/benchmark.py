import sys
import os
import time
import tracemalloc
import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, r2_score

# Add backend to path to import fivedreg
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from fivedreg.model import FiveDNet
from fivedreg.data import split_data, standardize_data

def generate_synthetic_data(n_samples: int):
    """Generates synthetic 5D data for benchmarking."""
    np.random.seed(42)
    X = np.random.rand(n_samples, 5)
    # Simple linear relationship + noise for target
    weights = np.array([1.5, -2.0, 0.5, 3.0, -1.0])
    y = np.dot(X, weights) + np.random.normal(0, 0.1, n_samples)
    return X, y

def profile_training(n_samples: int):
    """Profiles training time and memory for a given dataset size."""
    print(f"\n--- Benchmarking with {n_samples} samples ---")
    
    # Generate data
    X, y = generate_synthetic_data(n_samples)
    
    # Split and standardize
    X_train, y_train, X_val, y_val, X_test, y_test = split_data(X, y)
    X_train_scaled, X_val_scaled, X_test_scaled = standardize_data(X_train, X_val, X_test, save_path=None)
    
    # Initialize model
    model = FiveDNet(hidden_layers=[64, 32, 16], max_epochs=50, verbose=0)
    
    # Profile Memory and Time
    tracemalloc.start()
    start_time = time.time()
    
    model.fit(X_train_scaled, y_train, validation_split=0.2)
    
    end_time = time.time()
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    
    training_time = end_time - start_time
    peak_memory_mb = peak / 1024 / 1024
    
    print(f"Training Time: {training_time:.4f} seconds")
    print(f"Peak Memory Usage: {peak_memory_mb:.4f} MB")
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"MSE: {mse:.4f}")
    print(f"R2 Score: {r2:.4f}")
    
    return {
        "samples": n_samples,
        "training_time_sec": training_time,
        "peak_memory_mb": peak_memory_mb,
        "mse": mse,
        "r2": r2
    }, model

def profile_prediction(model, n_samples=1000):
    """Profiles prediction memory usage."""
    print(f"--- Profiling Prediction with {n_samples} samples ---")
    X, _ = generate_synthetic_data(n_samples)
    
    # Mock scaler for prediction (just centering for simplicity in benchmark)
    X_scaled = (X - 0.5) / 0.28 # Approx std for uniform [0,1]
    
    tracemalloc.start()
    start_time = time.time()
    
    model.predict(X_scaled)
    
    end_time = time.time()
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    
    pred_time = end_time - start_time
    pred_peak_mb = peak / 1024 / 1024
    
    print(f"Prediction Time: {pred_time:.4f} seconds")
    print(f"Prediction Peak Memory: {pred_peak_mb:.4f} MB")
    
    return pred_time, pred_peak_mb

def main():
    dataset_sizes = [1000, 5000, 10000]
    n_iterations = 5
    results = []
    
    for size in dataset_sizes:
        print(f"\n=== Benchmarking size {size} ({n_iterations} iterations) ===")
        iteration_results = []
        last_model = None
        
        for i in range(n_iterations):
            print(f"  Iteration {i+1}/{n_iterations}...")
            res, model = profile_training(size)
            
            # Profile prediction
            pred_time, pred_peak_mb = profile_prediction(model, n_samples=size)
            res["prediction_time_sec"] = pred_time
            res["prediction_peak_memory_mb"] = pred_peak_mb
            
            iteration_results.append(res)
            last_model = model
            
        # Calculate averages
        avg_res = {
            "samples": size,
            "training_time_sec": np.mean([r["training_time_sec"] for r in iteration_results]),
            "training_time_std": np.std([r["training_time_sec"] for r in iteration_results]),
            "peak_memory_mb": np.mean([r["peak_memory_mb"] for r in iteration_results]),
            "mse": np.mean([r["mse"] for r in iteration_results]),
            "r2": np.mean([r["r2"] for r in iteration_results]),
            "prediction_time_sec": np.mean([r["prediction_time_sec"] for r in iteration_results]),
            "prediction_peak_memory_mb": np.mean([r["prediction_peak_memory_mb"] for r in iteration_results])
        }
        results.append(avg_res)
        
    print("\n--- Summary (Averaged over 5 runs) ---")
    df = pd.DataFrame(results)
    print(df)
    
    # Save to CSV
    df.to_csv("benchmark_results.csv", index=False)
    print("\nResults saved to benchmark_results.csv")

if __name__ == "__main__":
    main()
