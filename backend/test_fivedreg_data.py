import unittest
import numpy as np
import pickle
import os
from fivedreg.data import load_dataset, split_data, standardize_data

class TestFivedregData(unittest.TestCase):
    
    def setUp(self):
        self.test_file = 'test_dataset.pkl'
        self.X = np.random.rand(100, 5).astype(np.float32)
        self.y = np.random.rand(100).astype(np.float32)
        
        # Introduce some NaNs
        self.X_nan = self.X.copy()
        self.X_nan[0, 0] = np.nan
        self.y_nan = self.y.copy()
        self.y_nan[1] = np.nan
        
        with open(self.test_file, 'wb') as f:
            pickle.dump({'X': self.X, 'y': self.y}, f)
            
        self.test_file_nan = 'test_dataset_nan.pkl'
        with open(self.test_file_nan, 'wb') as f:
            pickle.dump({'X': self.X_nan, 'y': self.y_nan}, f)

    def tearDown(self):
        if os.path.exists(self.test_file):
            os.remove(self.test_file)
        if os.path.exists(self.test_file_nan):
            os.remove(self.test_file_nan)

    def test_load_dataset_valid(self):
        X, y = load_dataset(self.test_file)
        self.assertEqual(X.shape, (100, 5))
        self.assertEqual(y.shape, (100,))
        
    def test_load_dataset_nan(self):
        # Should drop 2 rows (one with NaN in X, one with NaN in y)
        X, y = load_dataset(self.test_file_nan)
        self.assertEqual(X.shape, (98, 5))
        self.assertEqual(y.shape, (98,))

    def test_split_data(self):
        X_train, y_train, X_val, y_val, X_test, y_test = split_data(self.X, self.y, 0.7, 0.15, 0.15)
        self.assertEqual(X_train.shape[0], 70)
        self.assertEqual(X_val.shape[0], 15)
        self.assertEqual(X_test.shape[0], 15)
        
    def test_standardize_data(self):
        X_train, y_train, X_val, y_val, X_test, y_test = split_data(self.X, self.y)
        X_train_s, X_val_s, X_test_s = standardize_data(X_train, X_val, X_test)
        
        # Check mean is approx 0 and std is approx 1 for train set
        self.assertTrue(np.allclose(np.mean(X_train_s, axis=0), 0, atol=1e-6))
        self.assertTrue(np.allclose(np.std(X_train_s, axis=0), 1, atol=1e-6))

if __name__ == '__main__':
    unittest.main()
