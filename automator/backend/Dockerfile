# Use a Python 3.12 base image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the application files to the container
COPY . /app

# Install dependencies from requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Optionally, set ASSET_TYPES if needed. You can also pass it as an argument during docker run.
# ENV ASSET_TYPES="compute.googleapis.com/Instance,storage.googleapis.com/Bucket,..."

# Expose the port your Flask app runs on (default is 5000)
EXPOSE 8080

# Command to run the Flask application
CMD ["python", "main.py"]