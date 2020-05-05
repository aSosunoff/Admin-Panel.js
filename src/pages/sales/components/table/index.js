import { HTMLBulder } from '../../../../utils/HTMLBulder.js';
import { TableInfinityServer } from '../../../../components/common/table/table-infinity-server/index.js';

export class TableSales extends TableInfinityServer {
	constructor(headersConfig, { url = null, sorted, pageSize = 5, urlQueryPerem = {} } = {}) {
		super(headersConfig, {
			url,
			sorted,
			pageSize,
			urlQueryPerem,
		});
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
				<div class="sortable-table__row" data-id-salary="${data.id}">
					${cells.map(({ id, template = templateDefault }) => template(data[id])).join('')}
				</div>`),
			),
		);
	}

	/**@override*/
	initEventListeners() {
		super.initEventListeners();
		this.element.addEventListener('click', this.onClickRow);
	}

	/**@override*/
	removeEventListeners() {
		super.removeEventListeners();
		this.element.removeEventListener('click', this.onClickRow);
	}

	onClickRow = ({ target }) => {
		const row = target.closest('.sortable-table__body .sortable-table__row');
		if (row) {
			this.element.dispatchEvent(
				new CustomEvent('selected-row', {
					detail: this.data.find(e => e.id === parseInt(row.dataset.idSalary)),
					bubbles: true,
				}),
			);
		}
	}
}
