import fetchJson from '../../utils/fetch-json.js';
import TablePagging from '../table-paging/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class TableServer extends TablePagging {
	url;
	isLoadind = false;
	filter;

	constructor(
		headersConfig,
		{
			url = '',
			sorted,
			pageSize = 5,
			filter = {
				from: new Date(),
				to: new Date(),
			},
		} = {},
	) {
		super(headersConfig, { data: [], sorted, pageSize });
		this.url = url.trim() ? new URL(url.trim(), BACKEND_URL) : null;
		this.filter = filter;
	}

	/**@override */
	async renderBody() {
		this.subElements.body.innerHTML = '';

		const firstPage = await this.getDataOfPage(1);

		this.data = firstPage;

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

	async setfilter({ from = this.filter.from, to = this.filter.to } = {}) {
		this.filter = {
			from,
			to,
		};
		await this.renderBody();
	}

	/**@override */
	async getDataOfPage(page) {
		const data = await this.loadData(page);

		return data || [];
	}

	async loadData(
		page = this.paggination.page,
		{
			id = this.sorted.id,
			order = this.sorted.order,
		} = {},
	) {
		if (!this.url) {
			return;
		}

		if (this.isLoadind) {
			return;
		}

		this.isLoadind = true;

		const { size } = this.paggination;

		this.url.searchParams.set('_sort', id);
		this.url.searchParams.set('_order', order);
		this.url.searchParams.set('_start', (page - 1) * size);
		this.url.searchParams.set('_end', (page - 1) * size + size);
		this.url.searchParams.set('from', new Date(TableServer.getDateTimeStamp(this.filter.from)).toISOString());
		this.url.searchParams.set('to', new Date(TableServer.getDateTimeStamp(this.filter.to)).toISOString());

		const data = await fetchJson(this.url);

		this.isLoadind = false;

		return data;
	}
}
