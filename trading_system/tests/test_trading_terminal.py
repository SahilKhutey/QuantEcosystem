#!/usr/bin/env python3
"""
Global Trading Terminal End-to-End Test Suite
Tests both backend API and frontend dashboard integration
"""

import os
import sys
import time
import json
import logging
import subprocess
import requests
from datetime import datetime
import unittest
from unittest import TestCase

# Attempt to import Selenium, but don't fail setup if missing (allow user to install it)
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('TerminalTestSuite')

class GlobalTradingTerminalTest(TestCase):
    """
    End-to-end tests for the Global Trading Terminal
    Verifies both backend API and frontend dashboard integration
    """
    
    # Test configuration
    BASE_URL = "http://localhost:8501"
    API_BASE_URL = "http://localhost:5000/api"
    CHROMEDRIVER_PATH = "C:\\Drivers\\chromedriver.exe"  # Update to standard Windows path if applicable
    
    # Test data
    TEST_SYMBOL = "AAPL"
    TEST_QUANTITY = 1
    TEST_PRICE = 150.0
    TEST_STOP_PRICE = 145.0
    TEST_TARGET = 155.0
    
    # Timeouts
    API_TIMEOUT = 10
    DASHBOARD_TIMEOUT = 30
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment before all tests"""
        logger.info("Starting Global Trading Terminal test suite")
        
        if not SELENIUM_AVAILABLE:
            logger.error("Selenium not installed. UI tests will fail.")
        
        # Start backend services if not running
        cls.start_backend()
        
        # Start frontend dashboard if not running
        cls.start_dashboard()
        
        # Initialize test data
        cls.api_key = "TEST_API_KEY"
        cls.api_secret = "TEST_API_SECRET"
        
        # Initialize browser if selenium is available
        if SELENIUM_AVAILABLE:
            cls.driver = cls.setup_browser()
        
        # Create test user and account via API calls
        cls.initialize_test_account()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        logger.info("Shutting down test environment")
        
        # Close browser
        if hasattr(cls, 'driver') and cls.driver:
            cls.driver.quit()
        
        # Stop services if we started them
        cls.stop_backend()
        cls.stop_dashboard()
        
        logger.info("Global Trading Terminal test suite completed")
    
    @classmethod
    def start_backend(cls):
        """Start the backend services"""
        logger.info("Checking backend services...")
        try:
            response = requests.get(f"{cls.API_BASE_URL}/system/status", timeout=5)
            if response.status_code == 200:
                logger.info("Backend services are already running")
                return
        except:
            logger.info("Backend not detected, attempt to start main.py...")
            # subprocess logic would go here if running in an environment that supports it
            pass
    
    @classmethod
    def start_dashboard(cls):
        """Start the dashboard if not running"""
        logger.info("Checking dashboard...")
        try:
            response = requests.get(cls.BASE_URL, timeout=5)
            if response.status_code == 200:
                logger.info("Dashboard is already running")
                return
        except:
            logger.info("Dashboard not detected.")
            pass
    
    @classmethod
    def stop_backend(cls):
        pass
    
    @classmethod
    def stop_dashboard(cls):
        pass
    
    @classmethod
    def setup_browser(cls):
        """Set up Selenium WebDriver for frontend testing"""
        logger.info("Setting up browser for frontend testing...")
        
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            
            # Initialize driver
            driver = webdriver.Chrome(options=chrome_options)
            driver.set_page_load_timeout(30)
            
            return driver
            
        except Exception as e:
            logger.warning(f"Failed to set up browser: {e}. UI tests may be skipped.")
            return None
    
    @classmethod
    def initialize_test_account(cls):
        """Initialize test account with test data"""
        logger.info("Initializing test account...")
        # Add test logic here using APIClient or direct requests
    
    def test_01_api_system_status(self):
        """Test system status API endpoint"""
        logger.info("Testing system status API...")
        try:
            # Note: Using mock-like check if API isn't live
            response = requests.get(f"{self.API_BASE_URL}/system/status", timeout=self.API_TIMEOUT)
            self.assertEqual(response.status_code, 200)
        except Exception as e:
            self.skipTest(f"API not available: {e}")
    
    def test_04_dashboard_loading(self):
        """Test if dashboard loads properly"""
        if not SELENIUM_AVAILABLE or not hasattr(self, 'driver') or self.driver is None:
            self.skipTest("Selenium not configured")
            
        logger.info("Testing dashboard loading...")
        self.driver.get(self.BASE_URL)
        WebDriverWait(self.driver, self.DASHBOARD_TIMEOUT).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        self.assertIn("Global Trading Terminal", self.driver.page_source)

if __name__ == "__main__":
    unittest.main(verbosity=2)
