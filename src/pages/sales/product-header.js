import { Table } from '../../components/table/table/index.js';
import { priceFormat } from '../../utils/priceFormat.js';

const header = [
	{
		id: 'images',
		title: 'Фото',
		sortable: false,
		template: data => {
			const tooltip = `
			<div class='sortable-table-tooltip-img'>
				${data.map(e => `<img src='${e.url}'>`).join('')}
			</div>`;
			return `
			<div class="sortable-table__cell">
				<img class="sortable-table-image" alt="Image" src="${data[0].url}" data-tooltip="${tooltip}">
			</div>`;
		},
	},
	{
		id: 'title',
		title: 'Наименование',
		sortable: true,
		sortType: 'string',
	},
	{
		id: 'subcategory',
		title: 'Категория',
		sortType: 'string',
		template: data => {
			const tooltip = `
			<div class='sortable-table-tooltip'>
				<span class='sortable-table-tooltip__category'>${data.category.title}</span> /
				<b class='sortable-table-tooltip__subcategory'>${data.title}</b>
			</div>`;

			return `<div class="sortable-table__cell" data-tooltip="${tooltip}">${data.title}</div>`;
		},
		sortable: (order, a, b) => {
			return Table.sort('string', order, a.title, b.title);
		}
	},
	{
		id: 'price',
		title: 'Цена',
		sortable: true,
		sortType: 'number',
		template: data => {
			return `<div class="sortable-table__cell">${priceFormat(data)}</div>`;
		},
	},
	{
		id: 'count',
		title: 'Количество',
		sortType: 'number',
		sortable: true,
	},
];

export default header;
