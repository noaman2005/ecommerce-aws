const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '₹0.00';
  }
  return currencyFormatter.format(value);
};
