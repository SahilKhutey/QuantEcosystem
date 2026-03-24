FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV STREAMLIT_SERVER_HEADLESS=true
ENV PYTHONPATH=/app

# Expose ports for UI and API
EXPOSE 8501 5000

# Entry point will be overridden by docker-compose or k8s
CMD ["python", "-m", "trading_system.main"]
