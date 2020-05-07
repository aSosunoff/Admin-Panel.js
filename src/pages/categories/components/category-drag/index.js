import { Category } from '../../../../components/category/index.js';
import { SortableList } from '../../../../components/sortable-list/index.js';

export class CategoryDrag extends Category {
	sortableList;

	constructor({ id = '', title = '', data = [] } = {}) {
		super({ title, data });
		this.id = id;
	}

	/**@override*/
	async render() {
		const element = await super.render();

		this.sortableList = new SortableList({
			container: element,
			childrenClass: 'sortable-list__item',
			dragClass: 'sortable-list__item_dragging',
			placeholderClass: 'sortable-list__placeholder',
		});

		this.sortableList.element.addEventListener('drag-stop', this.onDragStop);

		return element;
	}

	/**@override*/
	renderList(data = this.data) {
		return `
		<ul class="sortable-list">${data
			.map(
				item => `
            <li 
                class="categories__sortable-list-item sortable-list__item" 
                data-grab-handle 
                data-category-id="${this.id}"
                data-category-title="${this.title}"
                data-sub-category-id="${item.id}"
                data-sub-category-title="${item.title}">
				<strong>${item.title}</strong>
				<span>${item.text}</span>
			</li>`,
			)
			.join('')}
		</ul>`;
	}

	/**@override*/
	remove() {
		super.remove();
		this.sortableList.remove();
	}

	/**@override*/
	destroy() {
		super.destroy();
		this.sortableList.element.removeEventListener('drag-stop', this.onDragStop);
		this.sortableList.destroy();
		this.sortableList = null;
	}

	onDragStop = ({ detail }) => {
		this.element.dispatchEvent(
			new CustomEvent('category-drag-stop', {
				bubbles: true,
				detail: {
					categoryId: detail.dataset.categoryId,
					categoryTitle: detail.dataset.categoryTitle,
					subCategoryId: detail.dataset.subCategoryId,
					subCategoryTitle: detail.dataset.subCategoryTitle,
				},
			}),
		);
	};
}
