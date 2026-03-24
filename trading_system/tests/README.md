# How to Run the Global Trading Terminal Test Suite

## 2.1 Prerequisites
Before running the test suite, ensure you have:
- Python 3.8+ installed
- Required Python packages:
  ```bash
  pip install requests selenium pytest
  ```
- ChromeDriver installed (matching your Chrome version)
- The Global Trading Terminal system running (backend and frontend)

## 2.2 Running the Test Suite
```bash
# Run all tests
python tests/test_trading_terminal.py

# Run specific tests
python tests/test_trading_terminal.py GlobalTradingTerminalTest.test_01_api_system_status

# Run with detailed output
python tests/test_trading_terminal.py -v
```

## 2.3 Test Execution Flow
1. **Setup Phase**: Starts backend services, dashboard, and initializes test account.
2. **API Testing Phase**: Validates system status, risk metrics, trade execution, and circuit breakers.
3. **Dashboard Testing Phase**: UI verification using Selenium for navigation, trading, and risk controls.
4. **End-to-End Phase**: Validates complete signal-to-execution flows.
5. **Teardown Phase**: Cleans up test data and stops browser/service instances.

## 3. Test Suite Features
- **12 E2E Tests**: Comprehensive coverage of critical paths.
- **CI/CD Ready**: Designed for integration with Jenkins, GitHub Actions, etc.
- **Detailed Reporting**: Includes logging and failure screenshots.
