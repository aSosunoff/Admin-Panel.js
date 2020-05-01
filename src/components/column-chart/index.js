import HTMLBulder from '../../utils/HTMLBulder.js';
import subElementsFunc from '../../utils/subElements.js';

export default class ColumnChart {
	element;
	subElements = {};
	chartHeight = 50;

	constructor({ data = [], label = '', link = '', value = 0 } = {}) {
		this.data = data;
		this.label = label;
		this.link = link;
		this.value = value;
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

	getLink() {
		return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
	}

	get template() {
		return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </div>
        </div>
      </div>
    `;
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		if (this.data.length) {
			this.element.classList.remove(`column-chart_loading`);
		}

		this.subElements = subElementsFunc(this.element, '[data-element]');

		return this.element;
	}

	update({ headerData, bodyData }) {
		if (!bodyData.length) {
			return;
		}
		
		this.element.classList.remove(`column-chart_loading`);
		this.data = bodyData;
		this.subElements.header.textContent = headerData;
		this.subElements.body.innerHTML = this.getColumnBody(bodyData);
	}

	destroy() {
		this.element.remove();
	}
}
