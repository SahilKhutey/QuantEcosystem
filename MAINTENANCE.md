# MAINTENANCE & TROUBLESHOOTING GUIDE

This guide provides solutions for common issues and maintenance procedures for the Data Pipeline and Monitoring Dashboard.

## 1. Common Issues and Solutions

### Issue: Streamlit not loading properly
- **Symptoms**: White screen, infinite loading spinner, or "Connection reset" errors.
- **Diagnostics**: Check the browser console (F12) and server logs.
- **Solution**:
    - Ensure `STREAMLIT_SERVER_HEADLESS=true` is set.
    - Check if the port (8501) is correctly exposed and mapped.
    - Enable debug logging in `.streamlit/config.toml`: `[server] logLevel = "debug"`.

### Issue: API rate limits being exceeded
- **Symptoms**: "Data Freshness" status turns red, logs show `429 Too Many Requests`.
- **Solution**:
    - Increase the `update_interval` in `config/settings.py`.
    - Check if multiple instances are calling the same API key.
    - In `data_engine/data_pipeline.py`, ensure `time.sleep` or rate limiting logic is active.

### Issue: High memory usage
- **Symptoms**: Container restarts (OOMKilled), dashboard becomes sluggish.
- **Solution**:
    - Enable memory profiling:
      ```python
      import tracemalloc
      tracemalloc.start()
      ```
    - Review `DataStorage` queries; ensure you are not loading massive datasets entirely into memory.
    - Use `aggregator.get_market_data` with shorter timeframes for dashboard displays.

## 2. Maintenance Procedures

### Updating Dependencies
1. Update `requirements.txt`.
2. Rebuild the Docker image: `docker build -t data-monitoring-dashboard:latest .`.
3. Push to registry (ECR/Heroku) and update the service.

### Security Updates
- Regularly rotate the `STREAMLIT_SECRET_KEY` in your environment variables.
- Review and update CSP directives in `.streamlit/config.toml` as your domain changes.
- Ensure the base `python:3.10-slim` image is updated to the latest minor version for security patches.

## 3. Contact & Support
- **Engineers**: [Internal Team Name]
- **Channels**: Slack #quant-platform-ops
- **Alerting**: PagerDuty (linked via AWS SNS `alerts-topic`)
