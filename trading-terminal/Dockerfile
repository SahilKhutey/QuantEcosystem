# Build stage for React Frontend
FROM node:18 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage for Python Backend & Static Assets
FROM python:3.10-slim as production
WORKDIR /app

# Install system dependencies for pandas/numpy
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend build
COPY --from=build /app/dist /app/dist
COPY --from=build /app/public /app/public

# Copy backend code
COPY services /app/services
COPY main.py /app/main.py

# Set environment variables
ENV FLASK_APP=main.py
ENV FLASK_ENV=production

# Expose ports
EXPOSE 5000
EXPOSE 8000
EXPOSE 8765

# Run the application
CMD ["python", "main.py"]
