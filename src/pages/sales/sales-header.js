import { priceFormat } from '../../utils/priceFormat.js';

const header = [
	{
		id: 'id',
		title: 'ID',
		sortable: true,
	},
	{
		id: 'user',
		title: 'Клиент',
		sortable: true,
	},
	{
		id: 'createdAt',
		title: 'Дата',
		sortable: true,
		template: data => {
			let dateString = '';
			if (Date.parse(data)) {
				dateString = new Date(data).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: 'numeric' });
			}
			return `<div class="sortable-table__cell">${dateString}</div>`;
		},
	},
	{
		id: 'totalCost',
		title: 'Стоимость',
		sortable: true,
		template: data => {
			return `<div class="sortable-table__cell">${priceFormat(data)}</div>`;
		},
	},
	{
		id: 'delivery',
		title: 'Статус',
		sortable: true,
	},
];

export default header;
