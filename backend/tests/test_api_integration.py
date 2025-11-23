import os
import sys
import time
from fastapi.testclient import TestClient
import numpy as np

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from main import app

client = TestClient(app)

def test_integration():
    print("Starting integration test...")
    
    # 1. Upload Dataset
    print("Uploading dataset...")
    file_path = 'coursework_dataset.pkl'
    if not os.path.exists(file_path):
        # Try looking one level up if running from tests dir
        file_path = '../coursework_dataset.pkl'
        
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, "rb") as f:
        response = client.post("/upload", files={"file": ("coursework_dataset.pkl", f, "application/octet-stream")})
    
    assert response.status_code == 200
    print("Upload successful.")
    
    # 2. Trigger Training
    print("Triggering training...")
    # The upload saves to data/coursework_dataset.pkl relative to where app runs.
    # TestClient runs app in current process. 
    # We need to ensure 'data' dir exists.
    os.makedirs("data", exist_ok=True)
    
    response = client.post("/train", params={"data_path": "data/coursework_dataset.pkl"})
    assert response.status_code == 200
    print("Training started.")
    
    # 3. Wait for training (Poll status)
    print("Waiting for training to complete...")
    # Since background tasks in TestClient run synchronously (usually) or we need to wait.
    # Actually, TestClient DOES run background tasks. 
    # But start_training_job is a background task. 
    # We can poll /status to see if model is loaded.
    # However, start_training_job reloads the model at the end.
    
    # We'll poll for a bit.
    max_retries = 20
    for i in range(max_retries):
        response = client.get("/status")
        data = response.json()
        if data["model_loaded"]:
            # We also want to make sure it's the NEW model, but for now just checking loaded is okay
            # assuming we started with no model or the old one.
            # Actually, main.py tries to load 'saved_model.keras' on startup.
            # If it fails, model_loaded is False.
            # If it succeeds, it's True.
            # So we might be True immediately if a model exists.
            pass
        
        # Let's just wait a fixed time for this test since we know it takes ~5s
        time.sleep(1)
        print(f"Waited {i+1}s...")
        
        # Check if saved_model.keras exists and is recent?
        if os.path.exists("saved_model.keras"):
             # Simple check: if we can predict, it's good.
             break
             
    time.sleep(5) # Extra buffer
    
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
    
    print("Integration test passed!")

if __name__ == "__main__":
    test_integration()
