Testing
=======

The project uses ``pytest`` for backend testing.

Running Tests
-------------

To run the tests, navigate to the ``backend`` directory and run:

.. code-block:: bash

   pytest

Test Suite Description
----------------------

The test suite covers:

- **Unit Tests**:
    - ``tests/test_data.py``: Tests for data loading and processing.
    - ``tests/test_model.py``: Tests for model architecture and training logic.
- **Integration Tests**:
    - ``tests/test_api.py``: Tests for API endpoints (``/health``, ``/upload``, ``/train``, ``/predict``).

Coverage
--------

We aim for high test coverage for all core logic in ``fivedreg`` package and API endpoints.
