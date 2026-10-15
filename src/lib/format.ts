const number = new Intl.NumberFormat('en-PK');

export const formatNumber = (n: number) => number.format(n);

export const formatRs = (n: number) => `Rs ${number.format(n)}`;

export const pluralItems = (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`;

/** "03032593019" → "+92 303 259 3019" */
export function formatPhoneIntl(local: string): string {
  const d = local.replace(/\D/g, '').replace(/^0/, '');
  return `+92 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/** "03032593019" → "0303 259 3019" */
export function formatPhoneLocal(local: string): string {
  const d = local.replace(/\D/g, '');
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}
