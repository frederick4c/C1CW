#!/bin/bash

# Exit on error
set -e

echo "Building Sphinx documentation..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Activate virtual environment
if [ -d "backend/apivenv" ]; then
    source backend/apivenv/bin/activate
else
    echo "Error: Virtual environment not found in backend/apivenv"
    exit 1
fi

# Build documentation
sphinx-build -b html docs/source docs/build/html

echo "Documentation built successfully!"
echo "Open the following file in your browser to view:"
echo "file://$(pwd)/docs/build/html/index.html"
