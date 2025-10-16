export const formatSom = (amount: number | string): string => {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (isNaN(num as number)) return '';
  // Use locale with dot thousands separator and no decimals
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(num as number);
};


