import { HTMLBulder } from '../../../utils/HTMLBulder.js';
import subElementsFunc from '../../../utils/subElements.js';

import { ComponentContainer } from '../../../utils/ComponentContainer.js';
import { ProductFormComponent } from '../../../components/product/form/index.js';
import { SortableList } from '../../../components/sortable-list/index.js';

export default class Page {
	element;
	subElements = {};
	idProduct = null;
	component;
	sortableList;

	get template() {
		return `
		<div class="products-edit">
			<div class="content__top-panel">
				<h1 class="page-title">
					<a href="/products" class="link">Товары</a> / ${this.idProduct ? 'Редактировать' : 'Добавить' }
				</h1>
			</div>
			
			<div class="content-box" data-element="productForm"></div>
		</div>`;
	}

	constructor(match) {
		const [, idProduct = null] = match;
		this.idProduct = idProduct;
		this.initComponents(idProduct);
	}

	initComponents() {
		this.component = new ComponentContainer();

		this.component.add('productForm', new ProductFormComponent(this.idProduct));
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = subElementsFunc(this.element, '[data-element]');

		await this.component.renderComponents((nameComponent, element) => {
			this.subElements[nameComponent].append(element);
		});

		this.sortableList = new SortableList({
			container: this.component.components.productForm.element,
			childrenClass: 'sortable-list__item',
			dragClass: 'sortable-list__item_dragging',
			placeholderClass: 'sortable-list__placeholder',
		});

		this.initEventListeners();

		return this.element;
	}

	initEventListeners() {
		/* this.component.components.productFilter.element.addEventListener('form-filter', this.onFilter); */
	}

	removeEventListeners() {
		/* this.component.components.productFilter.element.removeEventListener(
			'form-filter',
			this.onFilter,
		); */
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.subElements = {};
		this.component.destroy();
		this.sortableList.destroy();
	}

	/* onFilter = ({ detail }) => {
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
	}; */
}
