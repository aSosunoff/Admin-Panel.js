import fetchJson from '../../utils/fetch-json.js';

import header from './bestsellers-header.js';

import PageBase from '../PageBase.js';

import TableServer from '../../components/table/table-server/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import RangePicker from '../../components/range-picker/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page extends PageBase {
	/**@override*/
	get template() {
		return `
		<div class="dashboard">
			<div class="content__top-panel">
				<h2 class="page-title">Панель управления</h2>
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

			<h3 class="block-title">Лидеры продаж</h3>

			<div data-element="tableServer">
				<!-- sortable-table component -->
			</div>
		</div>`;
	}

	constructor() {
		super();
	}

	/**@override*/
	initComponents() {
		const currentDate = new Date();
		const filter = {
			from: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()),
			to: currentDate,
		};

		this.components = {
			tableServer: new TableServer(header, {
				url: new URL('api/dashboard/bestsellers', BACKEND_URL),
				urlQueryPerem: {
					from: filter.from.toISOString(),
					to: filter.to.toISOString(),
				},
				pageSize: 10,
			}),
			ordersChart: new ColumnChart({
				label: 'Заказы',
				link: { href: 'sales', title: 'Подробнее' },
			}),
			salesChart: new ColumnChart({ label: 'Продажи' }),
			customersChart: new ColumnChart({ label: 'Клиенты' }),
			rangePicker: new RangePicker(filter),
		};
	}

	/**@override*/
	async render() {
		const element = await super.render();

		await this.initEventListeners();

		await this.updateChartData(this.components.rangePicker.selected);

		return element;
	}

	async getDataChart({ url, from, to }) {
		const chartUrl = new URL(url, BACKEND_URL);
		chartUrl.searchParams.set('from', from.toISOString());
		chartUrl.searchParams.set('to', to.toISOString());
		const chartData = await fetchJson(chartUrl);
		return chartData;
	}

	async updateChartData({ from, to }) {
		const [orderData, salesData, customersData] = await Promise.all([
			this.getDataChart({ url: 'api/dashboard/orders', from, to }),
			this.getDataChart({ url: 'api/dashboard/sales', from, to }),
			this.getDataChart({ url: 'api/dashboard/customers', from, to }),
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
		this.components.rangePicker.element.addEventListener('date-range-selected', async e => {
			this.components.tableServer.changeUrlQuery({
				from: e.detail.from.toISOString(),
				to: e.detail.to.toISOString(),
			});

			this.updateChartData(e.detail);
		});
	}
}
