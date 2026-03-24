import sys
import os

# Ensure the root package is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from trading_system.scripts.deploy_orchestrator import main

if __name__ == "__main__":
    main()
