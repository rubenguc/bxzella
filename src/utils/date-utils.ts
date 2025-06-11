export function transformTimeToLocalDate(time: number | string) {
  const date = new Date(time);
  const formattedDate = date.toLocaleDateString();
  return formattedDate;
}
