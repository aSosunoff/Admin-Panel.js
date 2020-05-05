import header from './sales-header.js';
import headerProduct from './product-header';

import { HTMLBulder } from '../../utils/HTMLBulder.js';
import { getSubElements } from '../../utils/getSubElements.js';
import fetchJson from '../../utils/fetch-json.js';

import { TableSales } from '../../components/page/sales/table/index.js';
import { RangePicker } from '../../components/common/range-picker/index.js';
import { Modal } from '../../components/common/modal/index.js';
import { Table } from '../../components/common/table/table/index.js';

import { ComponentContainer } from '../../utils/ComponentContainer.js';

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
						
			<div data-element="ordersContainer" class="full-height flex-column"></div>
			
			<div data-element="modalContainer"></div>
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

		this.component
			.add(
				'ordersContainer',
				new TableSales(header, {
					url: new URL('api/rest/orders', process.env.BACKEND_URL),
					pageSize: 15,
					urlQueryPerem: {
						// eslint-disable-next-line camelcase
						createdAt_gte: filter.from.toISOString(),
						// eslint-disable-next-line camelcase
						createdAt_lte: filter.to.toISOString(),
					},
				}),
			)
			.add('rangePicker', new RangePicker(filter))
			.add('modalContainer', new Modal({ title: 'Продукты' }))
			.add('ptoductTable', new Table(headerProduct));
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = getSubElements(this.element, '[data-element]');

		await this.component.renderComponents((nameComponent, element) => {
			if (this.subElements[nameComponent]) {
				this.subElements[nameComponent].append(element);
			}
		});

		this.initEventListeners();

		return this.element;
	}

	initEventListeners() {
		this.component.components.rangePicker.element.addEventListener(
			'date-range-selected',
			this.onChangeDateFilter,
		);
		this.component.components.ordersContainer.element.addEventListener(
			'selected-row',
			this.onOrdersContainerRowSelected,
		);
	}

	removeEventListeners() {
		this.component.components.rangePicker.element.removeEventListener(
			'date-range-selected',
			this.onChangeDateFilter,
		);
		this.component.components.ordersContainer.element.removeEventListener(
			'selected-row',
			this.onOrdersContainerRowSelected,
		);
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

	onOrdersContainerRowSelected = async ({ detail }) => {
		const data = [];

		for await (let element of detail.products) {
			const product = await this.loadProduct(element.product);
			data.push({ ...product, ...element });
		}

		this.component.components.ptoductTable.update(data);

		this.component.components.modalContainer.update({
			body: this.component.components.ptoductTable.element,
		});

		this.component.components.modalContainer.open();
	};

	async loadProduct(idProduct) {
		const url = new URL('api/rest/products', process.env.BACKEND_URL);
		url.searchParams.set('id', idProduct);
		url.searchParams.set('_embed', 'subcategory.category');
		const [data] = await fetchJson(url);
		return data;
	}
}
