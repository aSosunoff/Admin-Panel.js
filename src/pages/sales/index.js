import header from './sales-header.js';

import { HTMLBulder } from '../../utils/HTMLBulder.js';
import { getSubElements } from '../../utils/getSubElements.js';
import { TableSales } from '../../components/sales/table/index.js';
import { RangePicker } from '../../components/range-picker/index.js';

import { ComponentContainer } from '../../utils/ComponentContainer.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
	element;
	subElements = {};
	component;

	get template() {
		return `
		<div class="sales full-height flex-column">
            <div class="content__top-panel" data-element="rangePicker">
                <h1 class="page-title">Продажи</h1>
            </div>
						
            <div data-element="ordersContainer" class="full-height flex-column">
            </div>
		</div>`;
	}

	constructor() {
		this.initComponents();
	}

	initComponents() {
		this.component = new ComponentContainer();

		const currentDate = new Date();
		const filter = {
			from: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()),
			to: currentDate,
		};

		const ordersContainer = new TableSales(header, {
			url: new URL('api/rest/orders', BACKEND_URL),
			pageSize: 15,
			urlQueryPerem: {
				// eslint-disable-next-line camelcase
				createdAt_gte: filter.from.toISOString(),
				// eslint-disable-next-line camelcase
				createdAt_lte: filter.to.toISOString(),
			},
		});

		this.component
			.add('ordersContainer', ordersContainer)
			.add('rangePicker', new RangePicker(filter));
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = getSubElements(this.element, '[data-element]');

		await this.component.renderComponents((nameComponent, element) => {
			this.subElements[nameComponent].append(element);
		});

		this.initEventListeners();

		return this.element;
	}

	initEventListeners() {
		this.component.components.rangePicker.element.addEventListener('date-range-selected', this.onChangeDateFilter);
	}

	removeEventListeners() {
		this.component.components.rangePicker.element.removeEventListener('date-range-selected', this.onChangeDateFilter);
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.subElements = {};
		this.component.destroy();
	}

	onChangeDateFilter = ({ detail }) => {
		this.component.components.ordersContainer.changeUrlQuery({
			// eslint-disable-next-line camelcase
			createdAt_gte: detail.from.toISOString(),
			// eslint-disable-next-line camelcase
			createdAt_lte: detail.to.toISOString(),
		});
	};
}
