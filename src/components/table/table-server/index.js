import fetchJson from '../../../utils/fetch-json.js';
import { TablePagging } from '../table-paging/index.js';

export class TableServer extends TablePagging {
	url = null;
	isLoadind = false;
	urlQueryPerem = {};

	constructor(headersConfig, { url = null, sorted, pageSize = 5, urlQueryPerem = {} } = {}) {
		super(headersConfig, { data: [], sorted, pageSize });
		this.url = url;
		this.urlQueryPerem = urlQueryPerem;
	}

	/**@override */
	async renderBody() {
		this.subElements.body.innerHTML = '';

		this.paggination = { ...this.paggination, page: 1 };

		this.element.classList.add('sortable-table_loading');

		const firstPage = await this.getDataOfPage(1);

		this.element.classList.remove('sortable-table_loading');

		this.data = firstPage;

		if (!this.data.length) {
			this.element.classList.add('sortable-table_empty');
			return;
		}

		this.element.classList.remove('sortable-table_empty');

		this.renderNextRows(firstPage);
	}

	/**@override */
	async renderNextPage() {
		let dataChunk = await this.getDataOfPage(this.paggination.page + 1);

		if (dataChunk && dataChunk.length) {
			this.paggination.page += 1;
			this.renderNextRows(dataChunk);
			this.data.push(...dataChunk);
			return dataChunk;
		}
	}

	/**@override */
	async getDataOfPage(page) {
		const data = await this.loadData(page);

		return data || [];
	}

	async changeUrlQuery(urlQueryPerem) {
		this.urlQueryPerem = urlQueryPerem;
		await this.renderBody();
	}

	async loadData(
		page = this.paggination.page,
		{ id = this.sorted.id, order = this.sorted.order } = {},
	) {
		if (!this.url) {
			return;
		}

		if (this.isLoadind) {
			return;
		}

		this.isLoadind = true;

		const { size } = this.paggination;
		
		Array.from(this.url.searchParams.keys()).forEach((key) => {
			this.url.searchParams.delete(key);
		});

		this.url.searchParams.set('_sort', id);
		this.url.searchParams.set('_order', order);
		this.url.searchParams.set('_start', (page - 1) * size);
		this.url.searchParams.set('_end', (page - 1) * size + size);
		
		Object.entries(this.urlQueryPerem).forEach(([key, value]) => {
			this.url.searchParams.set(key, value);
		});

		const data = await fetchJson(this.url);

		this.isLoadind = false;

		return data;
	}
}
