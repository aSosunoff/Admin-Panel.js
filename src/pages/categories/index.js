import { HTMLBulder } from '../../utils/HTMLBulder.js';
import { getSubElements } from '../../utils/getSubElements.js';
import fetchJson from '../../utils/fetch-json.js';

import { CategoryDrag } from './components/category-drag/index.js';

export default class Page {
	element;
	subElements = {};
	categories = [];

	get template() {
		return `
		<div class="categories">
            <div class="content__top-panel">
                <h1 class="page-title">Категории товаров</h1>
            </div>

			<div data-element="categoriesContainer"></div>
		</div>`;
	}

	constructor() {}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = getSubElements(this.element, '[data-element]');

		this.updateCategory();

		this.initEventListeners();

		return this.element;
	}

	async updateCategory() {
		this.destroyCategory();

		const data = await this.loadCategories();

		for await (let cat of data) {
			const category = new CategoryDrag({
				id: cat.id,
				title: cat.title,
				data: cat.subcategories.map(e => ({
					title: e.title,
					text: `<b>${e.count}</b> products`,
					id: e.id,
				})),
			});
			this.categories.push(category);
			const element = await category.render();
			this.subElements.categoriesContainer.append(element);
		}
	}

	async loadCategories() {
		// eslint-disable-next-line no-undef
		const url = new URL('api/rest/categories', process.env.BACKEND_URL);
		url.searchParams.set('_sort', 'weight');
		url.searchParams.set('_refs', 'subcategory');
		const data = await fetchJson(url);
		return data;
	}

	initEventListeners() {
		this.element.addEventListener('category-drag-stop', this.onCategoryDragStop);
	}

	removeEventListeners() {
		this.element.removeEventListener('category-drag-stop', this.onCategoryDragStop);
	}

	remove() {
		this.element.remove();
	}

	destroyCategory() {
		this.categories.forEach(e => {
			e.destroy();
		});
		this.categories = [];
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.subElements = {};
		this.destroyCategory();
	}

	onCategoryDragStop({ detail }) {
		window.NotificationManager.success(
			'Успех',
			`Подкатегория "${detail.subCategoryTitle}" перенесена в категории "${detail.categoryTitle}"`,
		);
	}
}
