import HTMLBulder from '../../utils/HTMLBulder.js';
import subElementsFunc from '../../utils/subElements.js';
import fetchJson from '../../utils/fetch-json.js';

import header from './bestsellers-header.js';

import TableServer from '../../components/table-server/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import RangePicker from '../../components/range-picker/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
	element;
	subElements = {};
	components = {};

	constructor() {
		this.initComponents();
	}

	initComponents() {
		const filter = {
			from: new Date(2020, 0, 1),
			to: new Date(2020, 1, 5),
		};

		const tableServer = new TableServer(header, {
			url: 'api/dashboard/bestsellers',
			pageSize: 5,
			filter,
		});

		const ordersChart = new ColumnChart({
			label: 'Заказы',
			link: '#',
		});

		const salesChart = new ColumnChart({
			label: 'Продажи',
		});

		const customersChart = new ColumnChart({
			label: 'Клиенты',
		});

		const rangePicker = new RangePicker(filter);

		this.components.tableServer = tableServer;
		this.components.ordersChart = ordersChart;
		this.components.salesChart = salesChart;
		this.components.customersChart = customersChart;
		this.components.rangePicker = rangePicker;
	}

	get template() {
		return `
		<div class="dashboard">
			<div class="content__top-panel">
				<h2 class="page-title">Dashboard</h2>
				<div data-element="rangePicker">
				<!-- range-picker component -->
				</div>
			</div>
			<div data-element="chartsRoot" class="dashboard__charts">
				<!-- column-chart components -->
				<div data-element="ordersChart" class="dashboard__chart_orders"></div>
				<div data-element="salesChart" class="dashboard__chart_sales"></div>
				<div data-element="customersChart" class="dashboard__chart_customers"></div>
			</div>

			<h3 class="block-title">Best sellers</h3>

			<div data-element="tableServer">
				<!-- sortable-table component -->
			</div>
		</div>`;
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = subElementsFunc(this.element, '[data-element]');

		await this.renderComponents();

		await this.updateData(this.components.tableServer.filter);

		return this.element;
	}

	async renderComponents() {
		const promises = Object.values(this.components).map(item => item.render());
		const elements = await Promise.all(promises);
		Object.keys(this.components).forEach((component, index) => {
			this.subElements[component].append(elements[index]);
		});

		await this.initEventListeners();
	}

	async updateData({ from, to }) {
		const orderUrl = new URL('api/dashboard/orders', BACKEND_URL);
		orderUrl.searchParams.set('from', from.toISOString());
		orderUrl.searchParams.set('to', to.toISOString());

		const salesUrl = new URL('api/dashboard/sales', BACKEND_URL);
		salesUrl.searchParams.set('from', from.toISOString());
		salesUrl.searchParams.set('to', to.toISOString());

		const customersUrl = new URL('api/dashboard/customers', BACKEND_URL);
		customersUrl.searchParams.set('from', from.toISOString());
		customersUrl.searchParams.set('to', to.toISOString());

		const [orderData, salesData, customersData] = await Promise.all([
			fetchJson(orderUrl),
			fetchJson(salesUrl),
			fetchJson(customersUrl),
		]);

		this.components.ordersChart.update({
			headerData: Object.values(orderData).reduce((r, e) => r + e, 0),
			bodyData: Object.values(orderData),
		});
		this.components.salesChart.update({
			headerData: '$ ' + Object.values(salesData).reduce((r, e) => r + e, 0),
			bodyData: Object.values(salesData),
		});
		this.components.customersChart.update({
			headerData: Object.values(customersData).reduce((r, e) => r + e, 0),
			bodyData: Object.values(customersData),
		});
	}

	initEventListeners() {
		this.components.rangePicker.element.addEventListener('date-range-selected', e => {
			this.components.tableServer.setfilter(e.detail);
			this.updateData(e.detail);
		});
	}

	destroy() {
		for (const component of Object.values(this.components)) {
			component.destroy();
		}
	}
}
