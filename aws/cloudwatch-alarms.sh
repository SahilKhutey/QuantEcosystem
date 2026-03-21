#!/bin/bash

# aws/cloudwatch-alarms.sh

# Create CloudWatch alarms for critical metrics
aws cloudwatch put-metric-alarm \
  --alarm-name "Streamlit-Container-Error-Rate" \
  --alarm-description "Alarm when error rate exceeds 5%" \
  --namespace "ECS/ContainerInsights" \
  --metric-name "ContainerErrorRate" \
  --dimensions "Name=ClusterName,Value=data-monitoring-cluster" \
  --statistic Maximum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:alerts-topic

echo "CloudWatch alarm 'Streamlit-Container-Error-Rate' created successfully."
