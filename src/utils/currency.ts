export const formatCurrencyINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0, // Adjust as needed for decimal places
    maximumFractionDigits: 0, // Adjust as needed for decimal places
  }).format(amount);
};