import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--tertiary-dark);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.2s;
    
    &:focus-within {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
    }
    
    .prefix, .suffix {
      padding: 0 12px;
      color: var(--text-tertiary);
      font-size: 14px;
      font-weight: 500;
      background: rgba(255,255,255,0.02);
      height: 100%;
      display: flex;
      align-items: center;
    }
    
    input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 12px;
      color: var(--text-primary);
      font-size: 16px;
      font-weight: 600;
      outline: none;
      width: 100%;
    }
  }
  
  .slider-wrapper {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    
    input[type=range] {
      flex: 1;
      accent-color: var(--accent-blue);
    }
    
    span {
      font-size: 12px;
      color: var(--text-tertiary);
      min-width: 40px;
    }
  }
`;

const SIPCalculator = ({ inputs, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...inputs, [field]: value });
  };

  return (
    <Card>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: 4, height: 16, background: 'var(--accent-blue)', borderRadius: 2 }} />
        SIP Parameters
      </h2>

      <FormGroup>
        <label>Monthly Investment</label>
        <div className="input-wrapper">
          <div className="prefix">₹</div>
          <input 
            type="number" 
            value={inputs.monthlyAmount} 
            onChange={(e) => handleChange('monthlyAmount', e.target.value)}
          />
        </div>
        <div className="slider-wrapper">
          <span>1K</span>
          <input 
            type="range" min="1000" max="1000000" step="1000"
            value={inputs.monthlyAmount}
            onChange={(e) => handleChange('monthlyAmount', e.target.value)}
          />
          <span>10L</span>
        </div>
      </FormGroup>

      <FormGroup>
        <label>Expected Return Rate (p.a)</label>
        <div className="input-wrapper">
          <input 
            type="number" 
            value={inputs.rate} 
            onChange={(e) => handleChange('rate', e.target.value)}
          />
          <div className="suffix">%</div>
        </div>
        <div className="slider-wrapper">
          <span>1%</span>
          <input 
            type="range" min="1" max="30" step="0.5"
            value={inputs.rate}
            onChange={(e) => handleChange('rate', e.target.value)}
          />
          <span>30%</span>
        </div>
      </FormGroup>

      <FormGroup>
        <label>Time Period</label>
        <div className="input-wrapper">
          <input 
            type="number" 
            value={inputs.years} 
            onChange={(e) => handleChange('years', e.target.value)}
          />
          <div className="suffix">Years</div>
        </div>
        <div className="slider-wrapper">
          <span>1</span>
          <input 
            type="range" min="1" max="40" step="1"
            value={inputs.years}
            onChange={(e) => handleChange('years', e.target.value)}
          />
          <span>40</span>
        </div>
      </FormGroup>

      <FormGroup style={{ marginBottom: 0 }}>
        <label>Annual Step-Up (Optional)</label>
        <div className="input-wrapper">
          <input 
            type="number" 
            value={inputs.stepUp} 
            onChange={(e) => handleChange('stepUp', e.target.value)}
          />
          <div className="suffix">%</div>
        </div>
        <div className="slider-wrapper">
          <span>0%</span>
          <input 
            type="range" min="0" max="20" step="1"
            value={inputs.stepUp}
            onChange={(e) => handleChange('stepUp', e.target.value)}
          />
          <span>20%</span>
        </div>
      </FormGroup>
    </Card>
  );
};

export default SIPCalculator;
