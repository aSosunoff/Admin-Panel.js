import { HTMLBulder } from '../../utils/HTMLBulder.js';
import { getSubElements } from '../../utils/getSubElements.js';
import fetchJson from '../../utils/fetch-json.js';

import header from './bestsellers-header.js';

import { TableDashboard } from './componenets/table/index.js';
import { ColumnChart } from '../../components/column-chart/index.js';
import { RangePicker } from '../../components/range-picker/index.js';
import { priceFormat } from '../../utils/priceFormat.js';

import { ComponentContainer } from '../../utils/ComponentContainer.js';

export default class Page {
	element;
	subElements = {};
	component = {};

	get template() {
		return `
		<div class="dashboard full-height flex-column" data-element="tableServer">
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
			.add('tableServer', new TableDashboard(header, {
				// eslint-disable-next-line no-undef
				url: new URL('api/dashboard/bestsellers', process.env.BACKEND_URL),
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

		this.subElements = getSubElements(this.element, '[data-element]');

		await this.component.renderComponents((nameComponent, element) => {
			this.subElements[nameComponent].append(element);
		});

		this.initEventListeners();

		this.updateChartData(this.component.components.rangePicker.selected);

		return this.element;
	}

	async getDataChart({ url, from, to }) {
		// eslint-disable-next-line no-undef
		const chartUrl = new URL(url, process.env.BACKEND_URL);
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

		const sum = (numberArray) => numberArray.reduce((result, currentNumber) => result + currentNumber, 0);

		this.component.components.ordersChart.update({
			headerData: sum(Object.values(orderData)),
			bodyData: Object.values(orderData),
		});

		this.component.components.salesChart.update({
			headerData: priceFormat(sum(Object.values(salesData))),
			bodyData: Object.values(salesData),
		});

		this.component.components.customersChart.update({
			headerData: sum(Object.values(customersData)),
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

		this.updateChartData(detail);
	};
}
