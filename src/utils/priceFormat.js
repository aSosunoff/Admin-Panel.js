export function priceFormat(number) {
	return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD' }).format(number);
}
