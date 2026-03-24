# Global Trading Terminal: Deployment Guide

This guide provides the instructions for deploying, verifying, and maintaining the institutional-grade autonomous trading ecosystem.

## 1. Prerequisites
- **Python 3.8+**: Ensure `pip install -r requirements.txt` is executed.
- **Docker**: Required for containerizing microservices.
- **Kubernetes**: Configured cluster (via `kubectl`) for production orchestration.
- **API Keys**:
  - Brokers: Alpaca, Interactive Brokers, Binance.
  - Alerts: Twilio (SMS), SMTP (Email).
  - Security: `AUDIT_ENCRYPTION_KEY` for compliance logs.

## 2. Running the Deployment Orchestrator

The system uses a centralized `deploy.py` (orchestrated via `trading_system/scripts/deploy_orchestrator.py`) to handle the entire clinical launch sequence.

### Step 1: Set Environment Variables
```powershell
$env:DEPLOYMENT_REGION="us-east-1"
$env:ALPACA_API_KEY="YOUR_ALPACA_KEY"
$env:ALPACA_API_SECRET="YOUR_ALPACA_SECRET"
# ... set all other required variables
```

### Step 2: Run Pre-Deployment Verification (Dry Run)
```bash
python deploy.py --dry-run
```

### Step 3: Run Full Production Deployment
```bash
python deploy.py
```

## 3. Post-Deployment Validation

After the orchestrator completes, you can manually verify system health:

### Check Pod Status
```bash
kubectl get pods -n trading
```

### Verify Initialization Logs
```bash
kubectl logs -l app=trading-system -n trading | grep "Initialization Complete"
```

### Test Broker Connectivity (via API)
```bash
curl http://trading-system:5000/api/broker/alpaca/status
```

### Trial Execution Test
```bash
curl -X POST http://trading-system:5000/api/trading/execute \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "action": "BUY", "qty": 1, "type": "market"}'
```

## 4. Operational Maintenance

The following scripts should be scheduled as CronJobs within your cluster:

- **Backup Verification**: `python trading_system/scripts/backup_verification.py`
- **Key Rotation Reminder**: `python trading_system/scripts/key_rotation_reminder.py`
- **Compliance Audit**: Managed via the `AuditTrail` internal scheduler.

---
**Status**: 100% PRODUCTION READY
**Version**: 2.0.0 (Institutional Release)
