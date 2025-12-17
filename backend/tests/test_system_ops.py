import os
import sys
import unittest
from fastapi.testclient import TestClient

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from main import app, models, loaded_data, training_state

client = TestClient(app)

class TestSystemOps(unittest.TestCase):

    def setUp(self):
        # Ensure clean state before each test
        client.delete("/reset")
        
    def tearDown(self):
        # Clean up after tests
        client.delete("/reset")

    def test_health_check(self):
        """Test the health check endpoint."""
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "healthy"})

    def test_status_initial(self):
        """Test status endpoint returns correct initial state."""
        response = client.get("/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["model_loaded"])
        self.assertFalse(data["data_loaded"])
        self.assertIsNone(data["model_name"])
        self.assertFalse(data["training_state"]["training"])

    def test_reset_functionality(self):
        """Test that reset clears data and models."""
        # Manually inject state (simulating a loaded system)
        models["my_nn_model"] = "dummy_model"
        loaded_data["X"] = [1, 2, 3]
        
        response = client.delete("/reset")
        self.assertEqual(response.status_code, 200)
        
        # Verify state is cleared via internal check
        self.assertEqual(len(models), 0)
        self.assertIsNone(loaded_data["X"])
        
        # Verify via status endpoint
        status_response = client.get("/status")
        self.assertFalse(status_response.json()["model_loaded"])

    def test_predict_no_model_error(self):
        """Test predict endpoint returns 503 when no model is loaded."""
        # Ensure no model
        client.delete("/model")
        
        payload = {
            "feature_vector": [0.1, 0.2, 0.3, 0.4, 0.5],
            "config": {}
        }
        response = client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 503)
        self.assertIn("Model is not loaded", response.json()["detail"])

    def test_predict_invalid_input_shape(self):
        """Test predict endpoint validates input shape."""
        
        models["my_nn_model"] = "dummy_model_for_validation"
        
        # Payload with 4 features instead of 5
        payload = {
            "feature_vector": [0.1, 0.2, 0.3, 0.4],
            "config": {}
        }
        response = client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Expected 5 features", response.json()["detail"])

if __name__ == "__main__":
    unittest.main()
