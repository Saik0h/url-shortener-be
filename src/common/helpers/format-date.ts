export function formatDate(date: string): string {
  const d = new Date(date)
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  const pad = (n: number) => n.toString().padStart(2, '0');

  const formatted = `${pad(day)}/${pad(month)}/${year}`;
  console.log(date);
  console.log('member since:', formatted);
  return formatted;
}
