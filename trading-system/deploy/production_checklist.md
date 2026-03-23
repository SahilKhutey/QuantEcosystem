# Production Deployment Checklist

## 5.1 Pre-Deployment Verification
- [ ] **API Keys**: All API keys properly configured in secrets.
- [ ] **Risk Parameters**: Risk management parameters (position limits, drawdown threshold) set correctly.
- [ ] **Circuit Breaker**: System tested with real-world scenarios and halt conditions.
- [ ] **Data Pipeline**: Validated with multiple sources for data integrity and low latency.
- [ ] **Paper Trading**: Minimum 6 months of successful paper trading completed.
- [ ] **Critical Paths**: Order submission, real-time monitoring, and emergency shutdown tested.

## 5.2 Deployment Steps
1. **Build the container**:
   ```bash
   docker build -t trading-system:1.0 .
   ```
2. **Push to container registry**:
   ```bash
   docker tag trading-system:1.0 your-registry/trading-system:1.0
   docker push your-registry/trading-system:1.0
   ```
3. **Create secrets**:
   ```bash
   kubectl create secret generic trading-system-secrets \
     --from-literal=alpaca-key="YOUR_API_KEY" \
     --from-literal=alpaca-secret="YOUR_API_SECRET"
   ```
4. **Deploy to Kubernetes**:
   ```bash
   kubectl apply -f k8s/deployment.yaml
   ```
5. **Verify deployment**:
   ```bash
   kubectl get pods
   kubectl logs -f <pod-name>
   ```

## 6. monitoring & alerting
### 6.1 Critical Metrics to Monitor
| Metric | Alert Threshold | Action |
| --- | --- | --- |
| Daily Loss | > 5% | Circuit breaker |
| Account Drawdown | > 15% | Halt trading |
| Order Fill Rate | < 90% | Review execution logic |
| Data Freshness | > 5 minutes | Check data pipeline |
| API Error Rate | > 5% | Check broker connection |
