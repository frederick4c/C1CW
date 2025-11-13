import time
from typing import Any, Dict, List

import uvicorn
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- FastAPI App ---

# Initialize the FastAPI app
app = FastAPI(
    title="C1 Courswork - Neural Network API",
    description="An API to serve a machine learning model for predictions. By Fred - fl482",
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Test endpoint
@app.get("/api/test")
async def test_endpoint():
    return {"message": "Hello from the backend!"}

# --- Global Objects ---

# Dictionary to hold loaded model(s).
# Loading them into memory at startup is much faster than loading on every request.
models: Dict[str, Any] = {}


# --- Placeholder Functions ---
# These are the functions you would replace with your actual model logic.

def load_model(model_path: str) -> Any:
    """
    Loads your neural network model from a file path.
    This could be a .h5, .pth, .pkl, or any other format.
    """
    print(f"Loading model from {model_path}...")
    # --- YOUR CODE GOES HERE ---
    # Example (commented out):
    # import tensorflow as tf
    # model = tf.keras.models.load_model(model_path)
    #
    # import torch
    # model = MyModelClass()
    # model.load_state_dict(torch.load(model_path))
    # model.eval()
    
    # Using a simple mock object for this template
    mock_model = {"name": "MyMockModel", "version": 1.0, "path": model_path}
    print("Mock model 'loaded' successfully.")
    return mock_model


def run_prediction(model: Any, features: List[float], config: Dict | None) -> tuple[Any, float]:
    """
    Runs the actual prediction using the loaded model.
    """
    print(f"Running prediction with model: {model['name']}")
    print(f"Input features: {features}")
    
    # --- YOUR CODE GOES HERE ---
    # Example (commented out):
    # 1. Preprocess the input data (e.g., scaling, one-hot encoding)
    #    processed_input = my_preprocessor.transform([features])
    #
    # 2. Run the model prediction
    #    raw_prediction = model.predict(processed_input)
    #
    # 3. Postprocess the output
    #    # e.g., get the class with the highest probability
    #    class_index = raw_prediction.argmax()
    #    confidence = raw_prediction[0][class_index]
    #    final_prediction = {"class": class_index, "label": "MyLabel"}

    # Using mock results for this template
    mock_result = {"class": "A", "value": 0.987}
    mock_confidence = 0.987
    
    print(f"Prediction complete: {mock_result}")
    return mock_result, mock_confidence


def start_training_job(data_path: str):
    """
    A long-running function to train or fine-tune a model.
    This runs in the background.
    """
    print(f"Starting long training job with data from {data_path}...")
    
    # --- YOUR CODE GOES HERE ---
    # Example (commented out):
    # 1. Load training data
    #    (X_train, y_train) = load_data(data_path)
    #
    # 2. Get the model
    #    model = models.get("my_nn_model")
    #
    # 3. Run the training
    #    model.fit(X_train, y_train, epochs=10, batch_size=32)
    #
    # 4. Save the newly trained model
    #    model.save("path/to/new_model.h5")
    
    # Simulate a long task (e.g., 5 minutes)
    time.sleep(300) 
    
    print("Training job finished.")
    
    # After training, you probably want to reload the new model
    # This automatically makes it available for /predict requests
    print("Reloading model with new weights...")
    models["my_nn_model"] = load_model("path/to/new_model.h5")
    print("Model reloaded and ready.")


# --- Pydantic Schemas (Data Validation) ---
# These define the expected JSON structure for your API requests and responses.

class PredictionInput(BaseModel):
    """
    The input data structure for a prediction request.
    """
    feature_vector: List[float]
    config: Dict[str, Any] | None = None
    
    class Config:
        # This adds a sample for the /docs page
        json_schema_extra = {
            "example": {
                "feature_vector": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
                "config": {"use_gpu": True}
            }
        }


class PredictionOutput(BaseModel):
    """
    The output data structure for a prediction response.
    """
    prediction: Any
    confidence: float | None = None
    input_data: PredictionInput


class TrainingStatus(BaseModel):
    """
    The response for a training request.
    """
    message: str
    job_id: str | None = None


# --- Lifecycle Events ---

@app.on_event("startup")
async def startup_event():
    """
    On app startup, load the model(s) into the global 'models' dict.
    """
    print("--- App Startup ---")
    # Define the model you want to load
    # You could load multiple models here
    models["my_nn_model"] = load_model("path/to/my_model.h5")
    print("---------------------")


@app.on_event("shutdown")
async def shutdown_event():
    """
    On app shutdown, clear the models.
    """
    print("--- App Shutdown ---")
    models.clear()
    print("Models cleared.")
    print("----------------------")


# --- API Endpoints ---

@app.get("/")
async def read_root():
    """
    Root endpoint for a basic health check.
    """
    return {"status": "ok", "message": "api is running."}


@app.get("/status")
async def get_status():
    """
    Check if the model is loaded.
    """
    model_loaded = "my_nn_model" in models and models["my_nn_model"] is not None
    return {
        "model_loaded": model_loaded,
        "model_name": "my_nn_model" if model_loaded else None
    }


@app.post("/predict", response_model=PredictionOutput)
async def predict(input_data: PredictionInput):
    """
    Endpoint to make a prediction.
    It expects a JSON body matching the PredictionInput schema.
    """
    # 1. Get the loaded model
    model = models.get("my_nn_model")
    
    # 2. Check if model is loaded
    if not model:
        raise HTTPException(
            status_code=503,  # 503 Service Unavailable
            detail="Model is not loaded. Please wait or check server status.",
        )
            
    try:
        # 3. Run the prediction
        raw_prediction, confidence = run_prediction(
            model=model,
            features=input_data.feature_vector,
            config=input_data.config
        )
        
        # 4. Format and return the response
        return PredictionOutput(
            prediction=raw_prediction,
            confidence=confidence,
            input_data=input_data
        )
        
    except Exception as e:
        # Handle any errors that occur during prediction
        print(f"Error during prediction: {e}")
        raise HTTPException(
            status_code=500, # 500 Internal Server Error
            detail=f"An error occurred during prediction: {e}"
        )


@app.post("/train", response_model=TrainingStatus)
async def train_model(
    background_tasks: BackgroundTasks,
    data_path: str = "path/to/default/training_data.csv"
):
    """
    Endpoint to trigger a model training job.
    This job runs in the background so the API can respond immediately.
    """
    print("Received request to start training job.")
    
    # Add the long-running task to the background
    background_tasks.add_task(start_training_job, data_path)
    
    # Return an immediate response to the client
    return TrainingStatus(
        message="Model training started in the background.",
        job_id="some_unique_job_id_123"  # You could generate a real ID here
    )


# --- Main execution ---
# Run the application if this file is executed directly
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # auto-restarts on code changes
    )
