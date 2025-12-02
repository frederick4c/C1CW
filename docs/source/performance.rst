Performance and Profiling
=========================

This section details the performance characteristics of the ``FiveDNet`` model, including training time, memory usage, and scalability across different dataset sizes.

Benchmarking Methodology
------------------------

The benchmarking was conducted using synthetic 5D datasets of varying sizes: 1,000, 5,000, and 10,000 samples.
The tests were run on the local development environment. Each test was repeated 5 times, and the mean values are reported.

Metrics recorded:
*   **Training Time**: Wall-clock time to complete 50 epochs.
*   **Peak Memory Usage**: Maximum memory allocated during training and prediction.
*   **Accuracy**: Mean Squared Error (MSE) and R2 Score on a hold-out test set.

Results
-------

.. table:: Performance Benchmarks
   :widths: 20 20 20 20 20

   +-----------+---------------+------------------+--------+--------+
   | Samples   | Training Time | Peak Memory (MB) | MSE    | R2     |
   +===========+===============+==================+========+========+
   | 1,000     | 4.14s         | 3.33             | 0.0161 | 0.989  |
   +-----------+---------------+------------------+--------+--------+
   | 5,000     | 5.84s         | 3.19             | 0.0111 | 0.992  |
   +-----------+---------------+------------------+--------+--------+
   | 10,000    | 7.24s         | 3.32             | 0.0107 | 0.992  |
   +-----------+---------------+------------------+--------+--------+

Scalability Analysis
--------------------

*   **Training Time**: Training time increases with dataset size, but not strictly linearly. The slight decrease from 5k to 10k samples might be due to system variability or optimization overheads stabilizing.
*   **Memory Usage**: Memory usage remains relatively low and stable across dataset sizes, indicating good memory scalability for these dataset ranges.
*   **Accuracy**: MSE decreases and R2 increases as dataset size grows, confirming that more data improves model performance.

Prediction Profiling
--------------------

Memory usage during prediction was also profiled.
*   **Prediction Time (10k samples)**: 0.34s
*   **Peak Memory**: 0.50 MB
