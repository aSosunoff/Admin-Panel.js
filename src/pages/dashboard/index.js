import { HTMLBulder } from '../../utils/HTMLBulder.js';
import subElementsFunc from '../../utils/subElements.js';
import fetchJson from '../../utils/fetch-json.js';

import header from './bestsellers-header.js';

import { TableProduct } from '../../components/product/table/index.js';
import { ColumnChart } from '../../components/column-chart/index.js';
import { RangePicker } from '../../components/range-picker/index.js';

import { ComponentContainer } from '../../utils/ComponentContainer.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
	element;
	subElements = {};
	component = {};

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
		this.initComponents();
	}

	initComponents() {
		this.component = new ComponentContainer();

		const currentDate = new Date();
		const filter = {
			from: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()),
			to: currentDate,
		};

		this.component
			.add('tableServer', new TableProduct(header, {
				url: new URL('api/dashboard/bestsellers', BACKEND_URL),
				urlQueryPerem: {
					from: filter.from.toISOString(),
					to: filter.to.toISOString(),
				},
				pageSize: 10,
			}))
			.add('ordersChart', new ColumnChart({
				label: 'Заказы',
				link: { href: 'sales', title: 'Подробнее' },
			}))
			.add('salesChart', new ColumnChart({ label: 'Продажи' }))
			.add('customersChart', new ColumnChart({ label: 'Клиенты' }))
			.add('rangePicker', new RangePicker(filter));
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = subElementsFunc(this.element, '[data-element]');

		await this.component.renderComponents((nameComponent, element) => {
			this.subElements[nameComponent].append(element);
		});

		await this.initEventListeners();

		await this.updateChartData(this.component.components.rangePicker.selected);

		return this.element;
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

		this.component.components.ordersChart.update({
			headerData: Object.values(orderData).reduce((r, e) => r + e, 0),
			bodyData: Object.values(orderData),
		});

		this.component.components.salesChart.update({
			headerData: '$ ' + Object.values(salesData).reduce((r, e) => r + e, 0),
			bodyData: Object.values(salesData),
		});

		this.component.components.customersChart.update({
			headerData: Object.values(customersData).reduce((r, e) => r + e, 0),
			bodyData: Object.values(customersData),
		});
	}

	initEventListeners() {
		this.component.components.rangePicker.element.addEventListener('date-range-selected', this.onChangeDateFilter);
	}

	removeEventListeners() {
		this.component.components.rangePicker.element.removeEventListener('date-range-selected', this.onChangeDateFilter);
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.subElements = {};
		this.component.destroy();
	}

	onChangeDateFilter = async ({ detail }) => {
		this.component.components.tableServer.changeUrlQuery({
			from: detail.from.toISOString(),
			to: detail.to.toISOString(),
		});

		await this.updateChartData(detail);
	};
}
