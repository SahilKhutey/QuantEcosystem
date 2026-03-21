/**
 * SIP (Systematic Investment Plan) Calculation Engine
 */

export const calculateSIP = (monthlyAmount, rate, years, stepUp = 0) => {
  let balance = 0;
  let invested = 0;
  let currentMonthly = Number(monthlyAmount);
  const annualRate = Number(rate);
  const totalYears = Number(years);
  const stepUpRate = Number(stepUp);
  
  const monthlyRate = (annualRate / 100) / 12;
  const projection = [];
  
  // Year 0
  projection.push({
    year: 0,
    invested: 0,
    gained: 0,
    balance: 0,
  });
  
  for (let y = 1; y <= totalYears; y++) {
    for (let m = 1; m <= 12; m++) {
      invested += currentMonthly;
      balance = (balance + currentMonthly) * (1 + monthlyRate);
    }
    
    projection.push({
      year: y,
      invested: Math.round(invested),
      gained: Math.round(balance - invested),
      balance: Math.round(balance),
    });
    
    // Apply annual step-up
    if (stepUpRate > 0) {
      currentMonthly += currentMonthly * (stepUpRate / 100);
    }
  }
  
  const finalValue = Math.round(balance);
  const totalInvested = Math.round(invested);
  const totalGained = finalValue - totalInvested;
  
  const allocation = [
    { name: 'Total Invested', value: totalInvested, color: 'var(--accent-blue)' },
    { name: 'Est. Returns', value: totalGained, color: 'var(--accent-green)' }
  ];
  
  return { finalValue, totalInvested, totalGained, projection, allocation };
};
