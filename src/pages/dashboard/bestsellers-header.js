import { priceFormat } from '../../utils/priceFormat.js';

const header = [
	{
		id: 'images',
		title: 'Фото',
		sortable: false,
		template: data => {
			return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0].url}">
          </div>
        `;
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
	},
	{
		id: 'quantity',
		title: 'Количество',
		sortable: true,
		sortType: 'number',
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
		id: 'sales',
		title: 'Продажи',
		sortType: 'number',
	},
	/* {
		id: 'status',
		title: 'Status',
		sortable: true,
		sortType: 'number',
		template: data => {
			return `<div class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
		},
	}, */
];

export default header;
