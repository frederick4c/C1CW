# Neural Network Interpolator
Fred Lawrence (fl482@cam.ac.uk)

A full-stack machine learning system for interpolating 5-dimensional datasets as part of the C1 coursework for MPhil Data Intensive Science.

## Components

*   **Backend**: FastAPI application serving a TensorFlow neural network.
*   **Frontend**: Next.js application for user interaction.
*   **Documentation**: Sphinx-generated documentation.

## Setup and Installation

### Prerequisites

*   Docker and Docker Compose
*   Python 3.9+ (for local development)
*   Node.js 18+ (for local development)

### Quick Start (Docker)

To launch the entire application stack:

```bash
./scripts/start_app.sh
```

This will start:
*   Backend at http://localhost:8000
*   Frontend at http://localhost:3000

### Quick Start (Local Development)

If you prefer to run locally without Docker:

1.  **Backend Setup**:
    ```bash
    cd backend
    python -m venv apivenv
    source apivenv/bin/activate
    pip install -e ".[dev]"
    
    # Start the backend (in a new terminal)
    python main.py
    ```

2.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

Access the backend at `http://localhost:8000` and frontend at `http://localhost:3000`.

### Documentation
Documentation is generated using Sphinx and can be found on readthedocs.io at https://c1cw-5dneuralnet.readthedocs.io/en/latest/

To build the documentation locally:

```bash
./scripts/build_docs.sh
```

Open `docs/build/html/index.html` in your browser to view it.

## Environment Variables

The following environment variables are used in `docker-compose.yml`:

*   `PYTHONPATH`: Set to `/app` in the backend container.
*   `NODE_ENV`: Set to `production` in the frontend container.
*   `NEXT_PUBLIC_API_URL`: URL of the backend API (default: `http://localhost:8000`).

## Usage

1.  **Upload**: Go to `/upload` to upload a `.pkl` dataset containing `X` (features) and `y` (targets).
2.  **Train**: Go to `/train` to configure hyperparameters and start training the model.
3.  **Predict**: Go to `/predict` to input 5 feature values and get a prediction.

## Testing

To run backend tests:

```bash
cd backend
pytest
```
## AI Usage
Google Gemini in Antigravity IDE was used in the development of this project. It was used to debug and refactor code, as well as to generate the scripts and documentation. It was also used to generate much of the frontend code.