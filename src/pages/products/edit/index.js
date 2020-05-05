import { HTMLBulder } from '../../../utils/HTMLBulder.js';
import { getSubElements } from '../../../utils/getSubElements.js';

import { ComponentContainer } from '../../../utils/ComponentContainer.js';
import { ProductFormComponent } from './components/form/index.js';
import { SortableList } from '../../../components/common/sortable-list/index.js';

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

		this.subElements = getSubElements(this.element, '[data-element]');

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
		// TODO: add event submit form
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
}
