import os
import pickle
import numpy as np
from fastapi.testclient import TestClient
from main import app, loaded_data

client = TestClient(app)

def test_upload_endpoint():
    # Create a dummy pickle file
    test_file = "test_upload.pkl"
    X = np.random.rand(10, 5).astype(np.float32)
    y = np.random.rand(10).astype(np.float32)
    
    with open(test_file, "wb") as f:
        pickle.dump({"X": X, "y": y}, f)
        
    try:
        with open(test_file, "rb") as f:
            response = client.post(
                "/upload",
                files={"file": ("test_upload.pkl", f, "application/octet-stream")}
            )
            
        assert response.status_code == 200
        json_response = response.json()
        assert "message" in json_response
        assert "data_shape" in json_response
        assert json_response["data_shape"]["X"] == [10, 5]
        assert json_response["data_shape"]["y"] == [10]
        
        # Verify backend state
        assert loaded_data["X"] is not None
        assert loaded_data["y"] is not None
        assert loaded_data["X"].shape == (10, 5)
        
        # Verify file saved
        assert os.path.exists("data/test_upload.pkl")
        
    finally:
        # Cleanup
        if os.path.exists(test_file):
            os.remove(test_file)
        if os.path.exists("data/test_upload.pkl"):
            os.remove("data/test_upload.pkl")

if __name__ == "__main__":
    test_upload_endpoint()
    print("Upload test passed!")
