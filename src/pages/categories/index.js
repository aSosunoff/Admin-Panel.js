import { HTMLBulder } from '../../utils/HTMLBulder.js';
import { getSubElements } from '../../utils/getSubElements.js';
import fetchJson from '../../utils/fetch-json.js';

import { Category } from '../../components/category/index.js';

import { ComponentContainer } from '../../utils/ComponentContainer.js';

export default class Page {
	element;
	subElements = {};
	component = {};

	get template() {
		return `
		<div class="categories">
            <div class="content__top-panel">
                <h1 class="page-title">Категории товаров</h1>
            </div>

			<div data-element="categoriesContainer"></div>
		</div>`;
	}

	constructor() {
		this.initComponents();
	}

	initComponents() {
		this.component = new ComponentContainer();

		/* this.component
			.add('tableServer', new TableProduct(header, {
				url: new URL('api/dashboard/bestsellers', BACKEND_URL),
				urlQueryPerem: {
					from: filter.from.toISOString(),
					to: filter.to.toISOString(),
				},
				pageSize: 10,
			}))
			.add('ordersChart', new ColumnChart({
				label: 'Заказы',
				link: { href: 'sales', title: 'Подробнее' },
			}))
			.add('salesChart', new ColumnChart({ label: 'Продажи' }))
			.add('customersChart', new ColumnChart({ label: 'Клиенты' }))
			.add('rangePicker', new RangePicker(filter)); */
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = getSubElements(this.element, '[data-element]');

		await this.component.renderComponents((nameComponent, element) => {
			this.subElements[nameComponent].append(element);
		});

		this.updateCategory();

		this.initEventListeners();

		return this.element;
	}

	async updateCategory() {
		const data = await this.loadCategories();

		for await (let cat of data) {
			const category = new Category({
				title: cat.title,
				data: cat.subcategories.map(e => ({ title: e.title, text: `<b>${e.count}</b> products` })),
			});

			const element = await category.render();
			this.subElements.categoriesContainer.append(element);
		}
	}

	async loadCategories() {
		const url = new URL('api/rest/categories', process.env.BACKEND_URL);
		url.searchParams.set('_sort', 'weight');
		url.searchParams.set('_refs', 'subcategory');
		const data = await fetchJson(url);
		return data;
	}

	initEventListeners() {
		// this.component.components.rangePicker.element.addEventListener('date-range-selected', this.onChangeDateFilter);
	}

	removeEventListeners() {
		// this.component.components.rangePicker.element.removeEventListener('date-range-selected', this.onChangeDateFilter);
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
}
