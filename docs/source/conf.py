import os
import sys
sys.path.insert(0, os.path.abspath('../../backend'))

project = "Fred's NeuralNet"
author = 'Fred Lawrence'
release = '0.1.0'

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.viewcode',
    'sphinx.ext.githubpages',
]

templates_path = ['_templates']
exclude_patterns = []

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
