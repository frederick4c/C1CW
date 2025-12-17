Local Installation (Development)
================================

.. note::
   These instructions are for setting up a local development environment. For a quick start, we recommend using Docker as described in the README.

Prerequisites
-------------

- Python 3.8+
- Node.js 16+ (for frontend)

Backend Setup
-------------

1. Navigate to the ``backend`` directory:

   .. code-block:: bash

      cd backend

2. Create a virtual environment:

   .. code-block:: bash

      python3 -m venv apivenv
      source apivenv/bin/activate

3. Install dependencies:

   .. code-block:: bash

      pip install -e ".[dev]"

Frontend Setup
--------------

1. Navigate to the ``frontend`` directory:

   .. code-block:: bash

      cd frontend

2. Install dependencies:

   .. code-block:: bash

      npm install

3. Start the development server:

   .. code-block:: bash

      npm run dev
