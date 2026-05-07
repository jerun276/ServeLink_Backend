export const formatLkr = amount => {
  const numeric = Number(amount) || 0;
  const lkrAmount = Math.round(numeric * 1000);
  return `LKR ${lkrAmount.toLocaleString('en-LK')}`;
};

