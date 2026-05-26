export const getLtvClass = (ltv: number, brackets: { risk: number; normal: number }): string => {
  if (ltv > brackets.risk) return "bg-red-50 text-red-700 dark:bg-red-700/30 dark:text-red-300";
  if (ltv > brackets.normal) return "bg-amber-50 dark:bg-amber-700/30 text-amber-700 dark:text-amber-300";
  return "bg-blue-50 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300";
};

// Monthly PMT (fixed-rate mortgage payment)
export const pmt = (annualRate: number, termYears: number, principal: number) => {
  if (principal <= 0 || termYears <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

// Remaining mortgage balance after "paymentsMade" months
export const remainingBalance = (annualRate: number, termYears: number, principal: number, paymentsMade: number) => {
  if (principal <= 0 || termYears <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal * (1 - paymentsMade / (termYears * 12));
  return (
    principal * Math.pow(1 + r, paymentsMade) -
    pmt(annualRate, termYears, principal) * ((Math.pow(1 + r, paymentsMade) - 1) / r)
  );
};
