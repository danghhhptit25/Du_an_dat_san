export function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
}

export function todayString(): string {
  return new Date().toLocaleDateString('en-CA');
}