export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};