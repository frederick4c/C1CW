import pickle
import numpy as np
import os

file_path = '../coursework_dataset.pkl'

with open(file_path, 'rb') as f:
    data = pickle.load(f)
    X = data['X']
    y = data['y']
    print(f"X NaNs: {np.isnan(X).sum()}")
    print(f"y NaNs: {np.isnan(y).sum()}")
