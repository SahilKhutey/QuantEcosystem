import os

path = r'c:\Users\User\Documents\Quant\trading-terminal\src\pages\QuantEnginePage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Based on the view_file:
# 498:                          )}
# 499:                       />
# 500:                               </div>
# 501:                            </List.Item>
# 502:                         )}
# 503:                      />
# 504:                   </Card>

# Check if lines 500 to 503 are redundant
# Remember internal lines index starts at 0, so 500 is lines[499]
start_line = 500 # Adjust accordingly
if "</div>" in lines[499] and "</List.Item>" in lines[500]:
    print("Found redundant JSX. Removing lines 500 to 503...")
    # Delete lines 500, 501, 502, 503 (inclusive)
    # Indices: 499, 500, 501, 502
    del lines[499:503]
    print("JSX structure restored.")
else:
    print(f"Mismatch at 500: {lines[499].strip()}")
    # Alternative scan around 495-505
    found = False
    for i in range(490, 510):
        if "</div>" in lines[i] and "</List.Item>" in lines[i+1] and "/>" in lines[i+3]:
            print(f"Found redundant block at line {i+1}. Removing...")
            del lines[i:i+4]
            found = True
            break
    if not found:
        print("Failed to find exactly redundant block.")

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
