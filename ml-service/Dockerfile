FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app code and models
COPY app.py .
COPY models/ ./models/

EXPOSE 5000

CMD ["python", "app.py"]
