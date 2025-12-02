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

from fivedreg.data import load_dataset, split_data, standardize_data, Scaler
from fivedreg.model import FiveDNet
import shutil
import os
import numpy as np
from fastapi import UploadFile, File

# --- Global Objects ---

# Dictionary to hold loaded model(s).
# Loading them into memory at startup is much faster than loading on every request.
models: Dict[str, Any] = {}
# Global variable to hold the loaded dataset
loaded_data: Dict[str, Any] = {"X": None, "y": None}


# --- Placeholder Functions ---
# These are the functions you would replace with your actual model logic.

def load_model(model_path: str) -> Any:
    """
    Loads your neural network model from a file path.
    """
    print(f"Loading model from {model_path}...")
    
    if not os.path.exists(model_path):
        print(f"Model file {model_path} not found.")
        return None

    try:
        model = FiveDNet()
        model.load(model_path)
        print("Model loaded successfully.")
        return model
    except Exception as e:
        print(f"Failed to load model: {e}")
        return None


def run_prediction(model: Any, features: List[float], config: Dict | None) -> float:
    """
    Runs the actual prediction using the loaded model.
    """
    print(f"Running prediction...")
    print(f"Input features: {features}")
    
    # Convert features to numpy array and reshape
    features_arr = np.array(features).reshape(1, -1)
    
    # Load scaler and transform features
    scaler_path = "scaler_params.json"
    if os.path.exists(scaler_path):
        try:
            scaler = Scaler()
            scaler.load(scaler_path)
            features_arr = scaler.transform(features_arr)
            print("Features scaled successfully.")
        except Exception as e:
            print(f"Warning: Failed to load scaler: {e}. Using raw features.")
    else:
        print("Warning: Scaler file not found. Using raw features.")
    
    try:
        prediction = model.predict(features_arr)
        # Prediction is a numpy array, take the first element
        result = float(prediction[0])
        
        print(f"Prediction complete: {result}")
        return result
    except Exception as e:
        print(f"Prediction failed: {e}")
        raise e


# Global variable to track training status
training_state: Dict[str, Any] = {
    "training": False,
    "current_epoch": 0,
    "total_epochs": 0,
    "final_loss": None,
    "error": None,
    "loss_history": []
}

import tensorflow as tf

class TrainingCallback(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs=None):
        global training_state
        logs = logs or {}
        loss = logs.get('loss')
        training_state["current_epoch"] = epoch + 1
        if loss is not None:
             training_state["loss_history"].append({"epoch": epoch + 1, "loss": float(loss)})

def start_training_job(data_path: str, epochs: int, batch_size: int, learning_rate: float, hidden_size: int):
    """
    A long-running function to train or fine-tune a model.
    This runs in the background.
    """
    global training_state
    training_state["training"] = True
    training_state["current_epoch"] = 0
    training_state["total_epochs"] = epochs
    training_state["final_loss"] = None
    training_state["error"] = None
    training_state["loss_history"] = []
    
    print(f"Starting training job with data from {data_path}...")
    
    try:
        # 1. Load data
        # If data_path is default or doesn't exist, try to use loaded_data
        if (not os.path.exists(data_path) or data_path == "path/to/default/training_data.csv") and loaded_data["X"] is not None:
             print("Using pre-loaded data from memory.")
             X = loaded_data["X"]
             y = loaded_data["y"]
        elif os.path.exists(data_path):
             print(f"Loading data from {data_path}")
             X, y = load_dataset(data_path)
        else:
             print("No valid data found for training.")
             training_state["training"] = False
             training_state["error"] = "No valid data found"
             return

        # 2. Prepare data
        X_train, y_train, X_val, y_val, X_test, y_test = split_data(X, y)
        X_train_scaled, X_val_scaled, X_test_scaled = standardize_data(X_train, X_val, X_test)
        
        # 3. Initialize and train model
        print("Initializing and training FiveDNet...")
        # Using hidden_size from request
        model = FiveDNet(hidden_layers=[hidden_size, hidden_size // 2, hidden_size // 4], max_epochs=epochs, learning_rate=learning_rate, verbose=0)
        
        # Instantiate callback
        callback = TrainingCallback()
        
        history = model.fit(X_train_scaled, y_train, validation_split=0.2, callbacks=[callback])
        
        # 4. Save the model
        model_save_path = "saved_model.keras"
        model.save(model_save_path)
        print(f"Model saved to {model_save_path}")
        
        # 5. Reload the model
        models["my_nn_model"] = load_model(model_save_path)
        
        # 6. Update state
        training_state["training"] = False
        if history and hasattr(history, 'history') and 'loss' in history.history:
             training_state["final_loss"] = history.history['loss'][-1]
        else:
             training_state["final_loss"] = 0.0
        print(f"Training complete. Final loss: {training_state['final_loss']}")
        
    except Exception as e:
        print(f"Training failed: {e}")
        training_state["training"] = False
        training_state["error"] = str(e)


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
                "feature_vector": [0.1, 0.2, 0.3, 0.4, 0.5],
                "config": {"use_gpu": True}
            }
        }


class PredictionOutput(BaseModel):
    """
    The output data structure for a prediction response.
    """
    prediction: Any
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
    #potentially load model here   
    # models["my_nn_model"] = load_model("saved_model.keras")
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
    Check if the model is loaded and return training status.
    """
    model_loaded = "my_nn_model" in models and models["my_nn_model"] is not None
    data_loaded = loaded_data["X"] is not None
    return {
        "model_loaded": model_loaded,
        "data_loaded": data_loaded,
        "model_name": "my_nn_model" if model_loaded else None,
        "training_state": training_state
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

    # 3. Validate input dimensions
    if len(input_data.feature_vector) != 5:
        raise HTTPException(
            status_code=400,
            detail=f"Expected 5 features, got {len(input_data.feature_vector)}"
        )
            
    try:
        # 3. Run the prediction
        raw_prediction = run_prediction(
            model=model,
            features=input_data.feature_vector,
            config=input_data.config
        )
        
        # 4. Format and return the response
        return PredictionOutput(
            prediction=raw_prediction,
            input_data=input_data
        )
        
    except Exception as e:
        # Handle any errors that occur during prediction
        print(f"Error during prediction: {e}")
        raise HTTPException(
            status_code=500, # 500 Internal Server Error
            detail=f"An error occurred during prediction: {e}"
        )


class TrainingConfig(BaseModel):
    epochs: int = 100
    batch_size: int = 32
    learning_rate: float = 0.001
    hidden_size: int = 64
    data_path: str = "path/to/default/training_data.csv"

@app.post("/train", response_model=TrainingStatus)
async def train_model(
    background_tasks: BackgroundTasks,
    config: TrainingConfig
):
    """
    Endpoint to trigger a model training job.
    This job runs in the background so the API can respond immediately.
    """
    print(f"Received request to start training job with config: {config}")
    
    # Add the long-running task to the background
    background_tasks.add_task(
        start_training_job, 
        config.data_path,
        config.epochs,
        config.batch_size,
        config.learning_rate,
        config.hidden_size
    )
    
    # Return an immediate response to the client
    return TrainingStatus(
        message="Model training started in the background.",
        job_id="some_unique_job_id_123"  # You could generate a real ID here
    )


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Endpoint to upload a dataset file (.pkl).
    The file is saved and then loaded into memory.
    """
    try:
        os.makedirs("data", exist_ok=True)
        file_location = f"data/{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # Load the dataset
        X, y = load_dataset(file_location)
        
        # Update global state
        loaded_data["X"] = X
        loaded_data["y"] = y
        
        return {
            "message": f"File '{file.filename}' uploaded and loaded successfully.",
            "n_samples": X.shape[0],
            "n_features": X.shape[1],
            "data_shape": {
                "X": X.shape,
                "y": y.shape
            }
        }
    except Exception as e:
        print(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload and load data: {str(e)}")


@app.delete("/model")
async def delete_model():
    """
    Endpoint to delete the loaded model from memory.
    """
    if "my_nn_model" in models:
        del models["my_nn_model"]
        
    # Reset training state
    training_state["training"] = False
    training_state["current_epoch"] = 0
    training_state["total_epochs"] = 0
    training_state["final_loss"] = None
    training_state["error"] = None
    
    return {"message": "Model deleted successfully."}


@app.delete("/reset")
async def reset_state():
    """
    Endpoint to clear all data and models.
    """
    # Clear models
    models.clear()
    
    # Clear data
    loaded_data["X"] = None
    loaded_data["y"] = None
    
    # Reset training state
    training_state["training"] = False
    training_state["current_epoch"] = 0
    training_state["total_epochs"] = 0
    training_state["final_loss"] = None
    training_state["error"] = None
    
    return {"message": "All state cleared successfully."}


# --- Main execution ---
# Run the application if this file is executed directly
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # auto-restarts on code changes
    )
