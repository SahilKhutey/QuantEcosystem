/**
 * SWP (Systematic Withdrawal Plan) Calculation Engine
 */

export const calculateSWP = (corpus, withdrawal, rate, years, stepUp = 0) => {
  let balance = Number(corpus);
  let currentWithdrawal = Number(withdrawal);
  const annualRate = Number(rate) / 100;
  const monthlyRate = annualRate / 12;
  const stepUpRate = Number(stepUp) / 100;
  
  const projection = [];
  const cashflows = [];
  
  let totalWithdrawn = 0;
  let remainingMonths = 0;
  
  // Initial Year 0
  projection.push({ year: 0, balance: balance, invested: 0, gained: 0 });
  cashflows.push({ name: 'Initial', value: balance, isTotal: true });

  for (let y = 1; y <= Number(years); y++) {
    let yearWithdrawn = 0;
    let yearInterest = 0;
    
    for (let m = 1; m <= 12; m++) {
      if (balance <= 0) break;
      
      const interest = balance * monthlyRate;
      yearInterest += interest;
      balance += interest;
      
      const actualWithdrawal = Math.min(balance, currentWithdrawal);
      balance -= actualWithdrawal;
      yearWithdrawn += actualWithdrawal;
      totalWithdrawn += actualWithdrawal;
      remainingMonths++;
    }
    
    if (yearWithdrawn > 0 || yearInterest > 0) {
      if (y <= 5 || y % 5 === 0) {
        // Group cashflows to prevent chart clutter (only show first 5 years and every 5th year)
        cashflows.push({ name: `Y${y} Int`, value: Math.round(yearInterest), isTotal: false });
        cashflows.push({ name: `Y${y} Wdrl`, value: -Math.round(yearWithdrawn), isTotal: false });
      } else if (y === Number(years) && balance > 0) {
        cashflows.push({ name: `Y${y} Int`, value: Math.round(yearInterest), isTotal: false });
        cashflows.push({ name: `Y${y} Wdrl`, value: -Math.round(yearWithdrawn), isTotal: false });
      }
    }
    
    projection.push({
      year: y,
      balance: Math.max(0, Math.round(balance)),
      invested: Math.round(totalWithdrawn), // mapping parameter for generic ProjectionChart reuse
      gained: 0 // Keep 0 so projection chart behaves well (green line)
    });
    
    if (balance <= 0) break;
    
    if (stepUpRate > 0) currentWithdrawal += currentWithdrawal * stepUpRate;
  }
  
  cashflows.push({ name: 'Final', value: Math.round(balance), isTotal: true });
  
  return {
    finalBalance: Math.round(balance),
    totalWithdrawn: Math.round(totalWithdrawn),
    monthsLasted: remainingMonths,
    isDepleted: balance <= 0,
    projection,
    cashflows
  };
};
