import { HTMLBulder } from '../../../../../utils/HTMLBulder.js';
import { getSubElements } from '../../../../../utils/getSubElements.js';

import { DoubleSlider } from '../../../../../components/double-slider/index.js';
import { debounceDecorator } from '../../../../../utils/debounceDecorator.js';

import { ComponentContainer } from '../../../../../utils/ComponentContainer.js';

export class ProductFilter {
	element;
	subElements = {};
	component;

	get template() {
		return `
			<form class="form-inline">
				<div class="form-group">
					<label class="form-label">Фильтровать по:</label>
					<input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
				</div>
				
				<div class="form-group" data-elem="sliderContainer">
					<label class="form-label">Цена:</label>
				</div>
				
				<div class="form-group">
					<label class="form-label">Статус:</label>
					<select class="form-control" data-elem="filterStatus">
						<option value="" selected="">Любой</option>
						<option value="1">Активный</option>
						<option value="0">Неактивный</option>
					</select>
				</div>
			</form>`;
	}

	constructor() {
		this.initComponents();
		this.onFilter = debounceDecorator(this.onFilter, 500);
	}

	initComponents() {
		this.component = new ComponentContainer();

		this.component.add(
			'sliderContainer',
			new DoubleSlider({
				formatValue: value => '$' + value,
				selected: {
					from: 0,
					to: 4000,
				},
			}),
		);
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = getSubElements(this.element, '[data-elem]');

		await this.component.renderComponents((nameComponent, element) => {
			this.subElements[nameComponent].append(element);
		});

		this.initEventListeners();

		return this.element;
	}

	dispatch() {
		this.element.dispatchEvent(
			new CustomEvent('form-filter', {
				bubbles: true,
				detail: {
					filterName: this.subElements.filterName.value,
					filterStatus: this.subElements.filterStatus.value,
					filterSlider: this.component.components.sliderContainer.getValue(),
				},
			}),
		);
	}

	initEventListeners() {
		this.element.addEventListener('input', this.onFilter);
		this.component.components.sliderContainer.element.addEventListener(
			'range-select',
			this.onFilter,
		);
	}

	removeEventListeners() {
		this.element.removeEventListener('input', this.onFilter);
		this.component.components.sliderContainer.element.removeEventListener(
			'range-select',
			this.onFilter,
		);
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

	onFilter = ({ target }) => {
		if (target.closest('[data-elem="filterName"]')) {
			this.dispatch();
			return;
		}

		if (target.closest('[data-elem="filterStatus"]')) {
			this.dispatch();
			return;
		}

		if (target.closest('.range-slider')) {
			this.dispatch();
			return;
		}
	};
}
