import header from './products-header.js';

import { HTMLBulder } from '../../../utils/HTMLBulder.js';
import subElementsFunc from '../../../utils/subElements.js';
import { TableInfinityServer } from '../../../components/table/table-infinity-server/index.js';
import ProductFilter from './filter/index.js';

import { ComponentContainer } from '../../../components/component/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
	element;
	subElements = {};
	component;

	get template() {
		return `
		<div class="products-list">
            <div class="content__top-panel">
                <h1 class="page-title">Товары</h1>
                <a href="/products/add" class="button-primary">Добавить товар</a>
            </div>
			
			<div class="content-box content-box_small" data-element="productFilter"></div>
			
            <div data-element="productsContainer" class="products-list__container">
            </div>
		</div>`;
	}

	constructor() {
		this.initComponents();
	}

	initComponents() {
		this.component = new ComponentContainer();

		const productFilter = new ProductFilter();
		const { from, to } = productFilter.component.components.sliderContainer.selected;

		const productsContainer = new TableInfinityServer(header, {
			url: new URL('api/rest/products', BACKEND_URL),
			pageSize: 15,
			urlQueryPerem: {
				_embed: 'subcategory.category',
				// eslint-disable-next-line camelcase
				price_gte: from,
				// eslint-disable-next-line camelcase
				price_lte: to,
			},
		});

		this.component
			.add('productFilter', productFilter)
			.add('productsContainer', productsContainer);
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = subElementsFunc(this.element, '[data-element]');

		await this.component.renderComponents((nameComponent, element) => {
			this.subElements[nameComponent].append(element);
		});

		this.initEventListeners();

		return this.element;
	}

	initEventListeners() {
		this.component.components.productFilter.element.addEventListener('form-filter', this.onFilter);
	}

	removeEventListeners() {
		this.component.components.productFilter.element.removeEventListener(
			'form-filter',
			this.onFilter,
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

	onFilter = ({ detail }) => {
		const filter = {};

		if (detail.filterStatus) {
			filter.status = detail.filterStatus;
		}

		if (detail.filterName) {
			// eslint-disable-next-line camelcase
			filter.title_like = detail.filterName;
		}

		this.component.components.productsContainer.changeUrlQuery({
			_embed: 'subcategory.category',
			// eslint-disable-next-line camelcase
			price_gte: detail.filterSlider.from,
			// eslint-disable-next-line camelcase
			price_lte: detail.filterSlider.to,
			...filter,
		});
	};
}
