export function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const pad = (n: number) => n.toString().padStart(2, '0');

  const formatted = `${pad(day)}/${pad(month)}/${year}`;
  console.log(date);
  console.log('member since:', formatted);
  return formatted;
}
