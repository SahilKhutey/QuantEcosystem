import os
import re

dir_path = r'c:\Users\User\Documents\Quant\trading-terminal\src\services\api'
files = [f for f in os.listdir(dir_path) if f.endswith('.js') and f != 'apiConfig.js']

# Pattern to find the existing API_BASE_URL definition
pattern = re.compile(r'const API_BASE_URL = [^;]+;')

for f in files:
    file_path = os.path.join(dir_path, f)
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if it already has the import to avoid duplicates
        if 'import { API_BASE_URL } from "./apiConfig";' in content:
            print(f'Skipping {f} (already updated)')
            continue
            
        if pattern.search(content):
            # Remove the old line and add the import at the top
            new_content = 'import { API_BASE_URL } from "./apiConfig";\n' + pattern.sub('', content, count=1)
            
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f'Updated {f}')
        else:
            print(f'Pattern not found in {f}')
    except Exception as e:
        print(f'Error processing {f}: {e}')
