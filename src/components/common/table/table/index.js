import { HTMLBulder } from '../../../../utils/HTMLBulder.js';
import { getSubElements } from '../../../../utils/getSubElements.js';

export class Table {
	element;
	subElements = {};
	headersConfig = [];
	sorted = {};
	data = [];

	static getDateTimeStamp = val => {
		if (Date.parse(val)) {
			return Date.parse(val);
		} else if (val instanceof Date) {
			return val.getTime();
		}

		return -1;
	};

	static sort = (() => {
		const sortStrategy = {
			number: (direction, a, b) => direction * (a - b),
			string: (direction, a, b) => direction * new Intl.Collator().compare(a, b),
			date: (direction, a, b) =>
				direction * (Table.getDateTimeStamp(a) - Table.getDateTimeStamp(b)),
		};

		return (type, order, a, b) => {
			const direction = 'asc' === order || !order ? 1 : -1;

			if (type in sortStrategy) {
				return sortStrategy[type](direction, a, b);
			}

			return sortStrategy[Object.keys(sortStrategy)[0]](direction, a, b);
		};
	})();

	get template() {
		return `
		<div class="sortable-table">
			<div data-elem="header" class="sortable-table__header sortable-table__row"></div>
			
			<div data-elem="body" class="sortable-table__body"></div>
			
			<div data-elem="loading" class="loading-line sortable-table__loading-line"></div>
			
			<div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">
				<div>
					<p>No products satisfies your filter criteria</p>
					<button type="button" class="button-primary-outline">Reset all filters</button>
				</div>
			</div>
		</div>`;
	}

	get arrowTemplate() {
		return `
		<span data-elem="arrow" class="sortable-table__sort-arrow">
			<span class="sort-arrow"></span>
		</span>`;
	}

	constructor(
		headersConfig,
		{
			data = [],
			sorted = {
				id: headersConfig.find(item => item.sortable).id,
				order: 'asc',
			},
		} = {},
	) {
		this.headersConfig = headersConfig;
		this.sorted = sorted;
		this.data = data;
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = {
			...getSubElements(this.element, '[data-elem]'),
			arrow: HTMLBulder.getElementFromString(this.arrowTemplate),
		};

		this.renderHeader();

		this.renderBody();

		this.initEventListeners();

		return this.element;
	}

	renderHeader() {
		this.subElements.header.innerHTML = this.headersConfig
			.map(
				({ id, sortable, title, sortType }) => `
				<div 
					class="sortable-table__cell" 
					data-id="${id}" 
					data-sortable="${Boolean(sortable) || Boolean(sortType)}"
					data-order="">
						<span>${title}</span>
				</div>`,
			)
			.join('');
	}

	renderBody() {
		this.subElements.body.innerHTML = '';

		this.renderNextRows(this.data);
	}

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
				<div class="sortable-table__row">
					${cells.map(({ id, template = templateDefault }) => template(data[id])).join('')}
				</div>`),
			),
		);
	}

	renderArrow(id, order) {
		const column = this.subElements.header.querySelector(`[data-id="${id}"]`);

		if (column) {
			column.dataset.order = order;
			column.append(this.subElements.arrow);
		}
	}

	initEventListeners() {
		this.subElements.header.addEventListener('click', this.onSortableCellHandler);
	}

	removeEventListeners() {
		this.subElements.header.removeEventListener('click', this.onSortableCellHandler);
	}

	sort(id = this.sorted.id, order = this.sorted.order) {
		this.sorted = {
			id,
			order,
		};

		this.renderArrow(this.sorted.id, this.sorted.order);

		this.data = this.getSortArray(this.data, this.sorted.id, this.sorted.order);

		this.renderBody();
	}

	getSortArray(arr, id, order) {
		const { sortType, sortable } = this.headersConfig.find(e => e.id === id);

		if (typeof sortable !== 'function') {
			return arr.sort((a, b) => Table.sort(sortType, order, a[id], b[id]));
		} else {
			return arr.sort((a, b) => sortable(this.sorted.order, a[this.sorted.id], b[this.sorted.id]));
		}
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.subElements = {};
	}

	onSortableCellHandler = ({ target }) => {
		let cellClick = target.closest('[data-sortable="true"]');

		if (cellClick) {
			const {
				dataset: { id, order },
			} = cellClick;

			this.sort(
				id,
				{
					asc: 'desc',
					desc: 'asc',
				}[order || 'desc'],
			);
		}
	};
}
