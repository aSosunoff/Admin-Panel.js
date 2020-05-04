import { HTMLBulder } from '../../../utils/HTMLBulder.js';
import { getSubElements } from '../../../utils/getSubElements.js';

export class ColumnChart {
	element;
	subElements = {};
	chartHeight = 0;
	link = {};
	data = [];
	label = '';
	value = 0;

	constructor({
		data = [],
		label = '',
		link = {
			href: '',
			title: '',
		},
		value = 0,
		chartHeight = 50,
	} = {}) {
		this.data = data;
		this.label = label;
		this.link = link;
		this.value = value;
		this.chartHeight = chartHeight;
	}

	getColumnBody(data) {
		const maxValue = Math.max(...data);

		return data
			.map(item => {
				const scale = this.chartHeight / maxValue;
				const percent = ((item / maxValue) * 100).toFixed(0);

				return `<div style="--value: ${Math.floor(
					item * scale,
				)}" data-tooltip="${percent}%"></div>`;
			})
			.join('');
	}

	get template() {
		return `
		<div class="column-chart column-chart_loading">
			<div class="column-chart__title" data-element="title"></div>
			<div class="column-chart__container">
				<div data-element="header" class="column-chart__header"></div>
				<div data-element="body" class="column-chart__chart"></div>
			</div>
		</div>`;
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = getSubElements(this.element, '[data-element]');

		this.update();

		return this.element;
	}

	update({
		label = this.label,
		link = this.link,
		headerData = this.value,
		bodyData = this.data,
		chartHeight = this.chartHeight,
	} = {}) {
		this.element.classList.add(`column-chart_loading`);

		if (!bodyData.length) {
			return;
		}

		this.element.classList.remove(`column-chart_loading`);

		this.value = headerData;
		this.data = bodyData;
		this.label = label;
		this.link = link;
		this.chartHeight = chartHeight;

		this.element.style.setProperty('--chart-height', this.chartHeight);

		this.subElements.title.textContent = this.label;
		this.subElements.title.append(
			HTMLBulder.getElementFromString(
				this.link
					? `<a class="column-chart__link" href="${this.link.href}">${this.link.title}</a>`
					: '',
			),
		);
		this.subElements.header.textContent = this.value;
		this.subElements.body.innerHTML = this.getColumnBody(this.data);
	}

	destroy() {
		this.element.remove();
		this.element = null;
		this.subElements = {};
		this.chartHeight = 0;
		this.link = {};
		this.data = [];
		this.label = '';
		this.value = 0;
	}
}
