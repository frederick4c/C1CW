Usage
=====

Running the Application
-----------------------

To run the full application (backend + frontend), you can use the provided startup script:

.. code-block:: bash

   ./start_app.sh

This script will start the FastAPI backend and the React frontend.

API Usage
---------

The backend provides several endpoints for training and prediction.

**Health Check**

.. code-block:: http

   GET /health

**Get Status**

.. code-block:: http

   GET /status

Returns the current status of the model (loaded/not loaded), data availability, and training state.

**Upload Dataset**

.. code-block:: http

   POST /upload

Upload a ``.pkl`` file containing the dataset.

**Train Model**

.. code-block:: http

   POST /train

Triggers the training process.

**Predict**

.. code-block:: http

   POST /predict

   {
       "input": [[0.1, 0.2, 0.3, 0.4, 0.5]]
   }

Returns the prediction for the given 5D input vector.

**Delete Model**

.. code-block:: http

   DELETE /model

Deletes the currently loaded model from memory.

**Reset State**

.. code-block:: http

   DELETE /reset

Clears all loaded data, models, and training state.
