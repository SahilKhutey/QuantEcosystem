import os
import re

path = r'c:\Users\User\Documents\Quant\trading-terminal\src\pages\QuantEnginePage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Regex for the Signal Hub List
# Matches everything from <List ... to </List.Item ... /> ... </List>
list_regex = r'<List\s+size="small"\s+dataSource=\{\s*\[\s*\{ name: \'LSTM Predictor\'.*?renderItem=\{item => \(.*?<List\.Item>.*?</div>\s*</List\.Item>\s* \)\s*\}\s*/>'
# Simplified: search for the start of the list and the end
list_pattern = re.compile(r'<List\s+size="small"\s+dataSource=\{\[\s+\{ name: \'LSTM Predictor\'.*?\}\s+renderItem=\{item => \(.*?\)\}\s+/>', re.DOTALL)

# Let's try matching from exactly line 484 based on the latest view
# Or just replace the entire Neural Signal Hub and RL Monitor tabs content.

replacement_list = """                      <List
                         size="small"
                         dataSource={fusionData}
                         renderItem={item => (
                            <List.Item>
                               <div style={{ width: '100%' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <span>{item.name}</span>
                                     <Tag color={item.value > 0.6 ? 'green' : 'orange'}>{item.value.toFixed(2)}</Tag>
                                  </div>
                                  <Progress percent={(item.weight || 0.25) * 100} strokeColor={item.value > 0.6 ? '#1890ff' : '#faad14'} size="small" />
                               </div>
                            </List.Item>
                         )}
                      />"""

# Actually, I'll just find the start and end indices of the mock list
start_marker = "dataSource={["
end_marker = "/>"
# No, that's dangerous. 

# BETTER: Use a literal search but split by lines to handle ANY indentation prefix
lines = content.split('\n')
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "dataSource={[" in line and "name: 'LSTM Predictor'" in lines[i+1]:
        start_idx = i - 2 # <List 
        print(f"Found start at line {i}")
    if start_idx != -1 and "/>" in line and i > start_idx + 10:
        end_idx = i
        print(f"Found end at line {i}")
        break

if start_idx != -1 and end_idx != -1:
    print(f"Replacing lines {start_idx} to {end_idx}...")
    # Keep the indentation of the <List line
    indent = lines[start_idx].split('<')[0]
    # Re-indent the replacement
    formatted_replacement = "\n".join([f"{indent}{l.strip()}" for l in replacement_list.split('\n')])
    # Swap it out
    new_lines = lines[:start_idx] + [replacement_list] + lines[end_idx+1:]
    content = '\n'.join(new_lines)
    print("Success.")
else:
    print("Failed to find list markers via line scan.")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
