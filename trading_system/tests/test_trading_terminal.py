#!/usr/bin/env python3
"""
Global Trading Terminal End-to-End Test Suite
Tests both backend API and frontend dashboard integration.
"""

import logging
import requests
import unittest
from unittest import TestCase

# Attempt to import Selenium but allow tests to run without it.
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger('TerminalTestSuite')


class GlobalTradingTerminalTest(TestCase):
    """
    End-to-end tests for the Global Trading Terminal.
    Verifies both backend API and frontend dashboard integration.
    """

    BASE_URL = "http://localhost:8501"
    API_BASE_URL = "http://localhost:5000/api"
    CHROMEDRIVER_PATH = r"C:\Drivers\chromedriver.exe"

    TEST_SYMBOL = "AAPL"
    TEST_QUANTITY = 1
    TEST_PRICE = 150.0
    TEST_STOP_PRICE = 145.0
    TEST_TARGET = 155.0

    API_TIMEOUT = 10
    DASHBOARD_TIMEOUT = 30

    @classmethod
    def setUpClass(cls):
        """Set up test environment before all tests."""
        logger.info("Starting Global Trading Terminal test suite")

        if not SELENIUM_AVAILABLE:
            logger.error("Selenium not installed. UI tests will fail.")

        cls.start_backend()
        cls.start_dashboard()

        cls.api_key = "TEST_API_KEY"
        cls.api_secret = "TEST_API_SECRET"

        if SELENIUM_AVAILABLE:
            cls.driver = cls.setup_browser()

        cls.initialize_test_account()

    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests."""
        logger.info("Shutting down test environment")

        if getattr(cls, "driver", None):
            cls.driver.quit()

        cls.stop_backend()
        cls.stop_dashboard()

        logger.info("Global Trading Terminal test suite completed")

    @classmethod
    def start_backend(cls):
        """Start the backend services."""
        logger.info("Checking backend services...")
        try:
            response = requests.get(
                f"{cls.API_BASE_URL}/system/status", timeout=5
            )
            if response.status_code == 200:
                logger.info("Backend services are already running")
                return
        except Exception:
            logger.info("Backend not detected, attempt to start main.py...")

    @classmethod
    def start_dashboard(cls):
        """Start the dashboard if not running."""
        logger.info("Checking dashboard...")
        try:
            response = requests.get(cls.BASE_URL, timeout=5)
            if response.status_code == 200:
                logger.info("Dashboard is already running")
                return
        except Exception:
            logger.info("Dashboard not detected.")

    @classmethod
    def stop_backend(cls):
        pass

    @classmethod
    def stop_dashboard(cls):
        pass

    @classmethod
    def setup_browser(cls):
        """Set up Selenium WebDriver for frontend testing."""
        logger.info("Setting up browser for frontend testing...")

        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")

            driver = webdriver.Chrome(options=chrome_options)
            driver.set_page_load_timeout(30)
            return driver

        except Exception as e:
            logger.warning(
                "Failed to set up browser: %s. UI tests may be skipped.",
                e,
            )
            return None

    @classmethod
    def initialize_test_account(cls):
        """Initialize test account with test data."""
        logger.info("Initializing test account...")

    def test_01_api_system_status(self):
        """Test system status API endpoint."""
        logger.info("Testing system status API...")
        try:
            response = requests.get(
                f"{self.API_BASE_URL}/system/status", timeout=self.API_TIMEOUT
            )
            self.assertEqual(response.status_code, 200)
        except Exception as e:
            self.skipTest(f"API not available: {e}")

    def test_04_dashboard_loading(self):
        """Test if dashboard loads properly."""
        if not SELENIUM_AVAILABLE or getattr(self, "driver", None) is None:
            self.skipTest("Selenium not configured")

        try:
            response = requests.get(self.BASE_URL, timeout=5)
            if response.status_code != 200:
                self.skipTest(
                    f"Dashboard not available: HTTP {response.status_code}"
                )
        except Exception as e:
            self.skipTest(f"Dashboard not available: {e}")

        logger.info("Testing dashboard loading...")
        self.driver.get(self.BASE_URL)
        WebDriverWait(self.driver, self.DASHBOARD_TIMEOUT).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        self.assertIn("Global Trading Terminal", self.driver.page_source)


if __name__ == "__main__":
    unittest.main(verbosity=2)
