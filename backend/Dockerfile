# 1. Use an official Python base image
FROM python:3.11-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy *only* the requirements file first to leverage Docker's cache
COPY requirements.txt .

# 4. Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy all your backend code (main.py, nn_library/, etc.) into the container
COPY . .

# 6. Expose the port your app runs on
EXPOSE 8000

# 7. The default command to run. 
#    Note: This will be overridden by the 'command' in docker-compose.yml for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
