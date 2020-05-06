import { HTMLBulder } from '../../../../../utils/HTMLBulder.js';
import { TableInfinityServer } from '../../../../../components/table/table-infinity-server/index.js';

export class TableProduct extends TableInfinityServer {
	constructor(headersConfig, { url = null, sorted, pageSize = 5, urlQueryPerem = {} } = {}) {
		super(headersConfig, {
			url,
			sorted,
			pageSize,
			urlQueryPerem,
		});
	}

	/**@override*/
	get templateEmptyPlaceholder() {
		return `
		<p>Не найдено товаров удовлетворяющих выбранному критерию</p>
		<button type="button" class="button-primary-outline">Очистить фильтры</button>`;
	}

	/**@override*/
	renderNextRows(data = []) {
		if (!data.length) {
			return;
		}

		const cells = this.headersConfig.map(({ id, template }) => ({
			id,
			template,
		}));

		const templateDefault = data => `<div class="sortable-table__cell">${data}</div>`;

		this.subElements.body.append(
			...data.map(data =>
				HTMLBulder.getElementFromString(`
				<a href="/products/${data.id}" class="sortable-table__row">
					${cells.map(({ id, template = templateDefault }) => template(data[id])).join('')}
				</a>`),
			),
		);
	}

	/**@override*/
	initEventListeners() {
		this.element.addEventListener('click', this.onClearFilter);
		super.initEventListeners();
	}

	/**@override*/
	removeEventListeners() {
		this.element.removeEventListener('click', this.onClearFilter);
		super.removeEventListeners();
	}

	onClearFilter = ({ target }) => {
		if (target.closest('.button-primary-outline')) {
			this.element.dispatchEvent(
				new CustomEvent('clear-filter', { bubbles: true }),
			);
		}
	};
}
