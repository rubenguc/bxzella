export function getSyncTimeRange(startTime?: number): {
  startTs: number;
  endTs: number;
} {
  let startTs = 0;
  if (startTime) {
    startTs = startTime;
  } else {
    const actualDate = new Date();
    const dateLess30Days = new Date(actualDate);
    dateLess30Days.setDate(dateLess30Days.getDate() - 30);
    startTs = dateLess30Days.getTime();
  }
  const endTs = Date.now();

  return { startTs, endTs };
}
