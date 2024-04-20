// todo: move to util function
function winRate(arr: {profit: number}[]) {
  const total = arr.length;
  let count = 0;

  if (total === 0) {
    return '0';
  }

  arr.forEach((item) => {
    if (item.profit > 0) {
      count += 1;
    }
  });

  return parseFloat(String((count / total) * 100)).toFixed(2);
}

export default winRate;
