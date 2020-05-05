import { HTMLBulder } from '../../../utils/HTMLBulder.js';
import { getSubElements } from '../../../utils/getSubElements.js';

export class Category {
	element;
	subElements = {};
	data = [];
	title = '';

	get template() {
		return `
		<div class="category category_open">
			<header class="category__header" data-element="title">Бытовая техника</header>
			<div class="category__body">
				<div class="subcategory-list" data-element="containerList"></div>
			</div>
		</div>`;
	}

	constructor(
		{
			title = '',
			data = [],
		} = {},
	) {
		this.title = title;
		this.data = data;
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = getSubElements(this.element, '[data-element]');

		this.update();

		this.initEventListeners();

		return this.element;
	}

	update({
		title = this.title,
		data = this.data,
	} = {}) {
		this.title = title;
		this.data = data;
		this.subElements.title.innerHTML = this.title;
		this.subElements.containerList.innerHTML = this.renderList(this.data);
	}

	renderList(data = this.data) {
		return `
		<ul class="sortable-list">${data.map(item => `
			<li class="categories__sortable-list-item sortable-list__item">
				<strong>${item.title}</strong>
				<span>${item.text}</span>
			</li>`).join('')}
		</ul>`;
	}

	toggleOpenClose() {
		this.element.classList.toggle('category_open');
	}

	initEventListeners() {
		this.element.addEventListener('pointerdown', this.onOpen);
	}

	removeEventListeners() {
		this.element.removeEventListener('pointerdown', this.onOpen);
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.subElements = {};
		this.data = [];
		this.title = '';
	}

	onOpen = ({ target, button }) => {
		let open = target.closest('.category__header');

		if (button !== 0) {
			return;
		}

		if (open) {
			this.toggleOpenClose();
		}
	};
}
