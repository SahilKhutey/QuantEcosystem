import os

path = r'c:\Users\User\Documents\Quant\trading-terminal\src\pages\QuantEnginePage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Target for the Signals List
target_list = """                      <List
                         size="small"
                         dataSource={[
                            { name: 'LSTM Predictor', weight: 0.30, bias: 0.82, color: '#1890ff' },
                            { name: 'Transformer (Market Attention)', weight: 0.30, bias: -0.15, color: '#f5222d' },
                            { name: 'XGBoost (Alpha-Feature)', weight: 0.20, bias: 0.45, color: '#52c41a' },
                            { name: 'News Sentiment LLM', weight: 0.20, bias: 0.65, color: '#faad14' }
                         ]}
                         renderItem={item => (
                            <List.Item>
                               <div style={{ width: '100%' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <span>{item.name}</span>
                                     <Tag color={item.bias > 0 ? 'green' : 'red'}>{item.bias > 0 ? '+' : ''}{item.bias}</Tag>
                                  </div>
                                  <Progress percent={item.weight * 100} strokeColor={item.color} size="small" />
                               </div>
                            </List.Item>
                         )}
                      />"""

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

# Target for the RL area (already partially fixed but I'll make sure)
# Actually, I'll just check if the list is there.
if target_list in content:
    print("Found target list. Replacing...")
    content = content.replace(target_list, replacement_list)
else:
    print("Target list NOT found using exact match. Trying smaller chunk...")
    # Fallback to a simpler replace
    if "LSTM Predictor" in content:
        print("Found LSTM Predictor. Attempting regex-like search...")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
