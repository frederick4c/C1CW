import os
import sys
import time
import pickle
import numpy as np
from fastapi.testclient import TestClient

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from main import app

client = TestClient(app)

def create_dummy_dataset(filename):
    """Creates a dummy 5D dataset for testing."""
    X = np.random.rand(100, 5)
    y = np.random.rand(100)
    data = {'X': X, 'y': y}
    with open(filename, 'wb') as f:
        pickle.dump(data, f)
    return filename

def test_full_flow():
    print("Starting full flow integration test...")
    
    # 0. Create dummy dataset
    dataset_path = "dummy_dataset.pkl"
    create_dummy_dataset(dataset_path)
    
    try:
        # 1. Upload Dataset
        print("Uploading dataset...")
        with open(dataset_path, "rb") as f:
            response = client.post("/upload", files={"file": ("dummy_dataset.pkl", f, "application/octet-stream")})
        
        assert response.status_code == 200
        print("Upload successful.")
        
        # 2. Trigger Training
        print("Triggering training...")
        # The upload saves to data/dummy_dataset.pkl
        uploaded_path = "data/dummy_dataset.pkl"
        
        response = client.post("/train", params={"data_path": uploaded_path})
        assert response.status_code == 200
        print("Training started.")
            # 3. Wait for training to complete
        # TestClient runs background tasks synchronously, so training is already done.
        print("Training completed (synchronous).")
        
        if not os.path.exists("scaler_params.json"):
             print("Error: scaler_params.json not found after training.")
             
        if not os.path.exists("saved_model.keras"):
             print("Error: saved_model.keras not found after training.")
        
        # 4. Predict
        print("Testing prediction...")
        # 5 features
        payload = {
            "feature_vector": [0.5, 0.5, 0.5, 0.5, 0.5],
            "config": {}
        }
        response = client.post("/predict", json=payload)
        
        if response.status_code != 200:
            print(f"Prediction failed: {response.text}")
        
        assert response.status_code == 200
        result = response.json()
        print(f"Prediction result: {result}")
        assert "prediction" in result
        assert isinstance(result["prediction"], float)
        
        # Verify scaler was used (we can't easily verify the exact value without mocking, 
        # but we verified the file exists)
        assert os.path.exists("scaler_params.json")
        
        print("Full flow test passed!")
        
    finally:
        # Cleanup
        if os.path.exists(dataset_path):
            os.remove(dataset_path)
        # We might want to keep the model/scaler for inspection, or clean them up.
        # For now, keep them.

if __name__ == "__main__":
    test_full_flow()
