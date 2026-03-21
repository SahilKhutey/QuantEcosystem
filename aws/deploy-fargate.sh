#!/bin/bash

# data_engine/aws/deploy-fargate.sh

# Create ECR repository
aws ecr create-repository --repository-name data-monitoring-dashboard

# Tag and push image
docker tag data-monitoring-dashboard:1.0.0 123456789012.dkr.ecr.us-east-1.amazonaws.com/data-monitoring-dashboard:1.0.0
aws ecr get-login-password | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/data-monitoring-dashboard:1.0.0

# Create ECS cluster
aws ecs create-cluster --cluster-name data-monitoring-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster data-monitoring-cluster \
  --service-name data-monitoring-service \
  --task-definition data-monitoring-dashboard:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-123456,subnet-789012],securityGroups=[sg-123456],assignPublicIp=ENABLED}"
