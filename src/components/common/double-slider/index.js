import { HTMLBulder } from '../../../utils/HTMLBulder.js';
import { getSubElements } from '../../../utils/getSubElements.js';

export class DoubleSlider {
	element;
	subElements = {};
	dragElement = {};

	get template() {
		return `
			<div class="range-slider">
				<span data-elem="from"></span>
				<div data-elem="inner" class="range-slider__inner">
					<span class="range-slider__progress" data-elem="progress"></span>
					<span class="range-slider__thumb-left" data-elem="left"></span>
					<span class="range-slider__thumb-right" data-elem="right"></span>
				</div>
				<span data-elem="to"></span>
			</div>`;
	}

	constructor({
		min = 100,
		max = 200,
		formatValue = value => value,
		selected = {
			from: min,
			to: max,
		},
	} = {}) {
		this.setSelected({ ...selected, min, max });
		this.formatValue = formatValue;
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);
		this.subElements = getSubElements(this.element, '[data-elem]');
		this.renderThumb();
		this.renderValue();
		this.initEventListeners();
		return this.element;
	}

	getValue = () => ({
		from: Math.floor(
			this.min + 0.01 * parseFloat(this.subElements.left.style.left) * (this.max - this.min),
		),
		to: Math.floor(
			this.max - 0.01 * parseFloat(this.subElements.right.style.right) * (this.max - this.min),
		),
	});

	setLeftPercent(clientX) {
		let percent =
			((clientX - this.subElements.inner.getBoundingClientRect().left) /
				this.subElements.inner.offsetWidth) *
			100;

		if (0 > percent) {
			percent = 0;
		}

		const percentRight = parseFloat(this.subElements.right.style.right);

		if (percentRight + percent > 100) {
			percent = 100 - percentRight;
		}

		this.subElements.left.style.left = `${percent}%`;
		this.subElements.progress.style.left = this.subElements.left.style.left;

		this.setSelected(this.getValue());
		this.renderValue();
		this.dispatchChange();
	}

	setRightPercent(clientX) {
		let percent =
			((this.subElements.inner.getBoundingClientRect().right - clientX) /
				this.subElements.inner.offsetWidth) *
			100;

		if (0 > percent) {
			percent = 0;
		}

		const percentLeft = parseFloat(this.subElements.left.style.left);

		if (percentLeft + percent > 100) {
			percent = 100 - percentLeft;
		}

		this.subElements.right.style.right = `${percent}%`;
		this.subElements.progress.style.right = this.subElements.right.style.right;

		this.setSelected(this.getValue());
		this.renderValue();
		this.dispatchChange();
	}

	initEventListeners() {
		this.element.addEventListener('pointerdown', this.onPointerDown);
	}

	removeEventListener() {
		this.element.removeEventListener('pointerdown', this.onPointerDown);
	}

	dispatchSelect() {
		this.element.dispatchEvent(
			new CustomEvent('range-select', {
				bubbles: true,
				detail: this.selected,
			}),
		);
	}

	dispatchChange() {
		this.element.dispatchEvent(
			new CustomEvent('range-change', {
				bubbles: true,
				detail: this.selected,
			}),
		);
	}

	setSelected({ max = this.max, min = this.min, from, to }) {
		this.min = Math.min(min, from);
		this.max = Math.max(max, to);
		this.selected = { from, to };
	}

	renderValue() {
		this.subElements.from.innerHTML = this.formatValue(this.selected.from);
		this.subElements.to.innerHTML = this.formatValue(this.selected.to);
	}

	renderThumb() {
		const oper = this.max - this.min;

		this.subElements.left.style.left = `${Math.floor(
			((this.selected.from - this.min) / oper) * 100,
		)}%`;
		this.subElements.progress.style.left = this.subElements.left.style.left;

		this.subElements.right.style.right = `${Math.floor(
			((this.max - this.selected.to) / oper) * 100,
		)}%`;
		this.subElements.progress.style.right = this.subElements.right.style.right;
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListener();
	}

	onPointerDown = event => {
		event.preventDefault();
		const { target, clientX } = event;

		if (!target.closest('.range-slider__inner')) {
			return;
		}

		this.element.classList.add('range-slider_dragging');
		document.addEventListener('pointermove', this.onPointerMove);
		document.addEventListener('pointerup', this.onPointerUp);

		const { left: rightLeft } = this.subElements.right.getBoundingClientRect();
		const { left: leftLeft } = this.subElements.left.getBoundingClientRect();

		const center = (rightLeft - leftLeft) / 2;

		if (rightLeft - center < clientX) {
			this.setRightPercent(clientX);
			this.dragElement = this.subElements.right;
			return;
		}

		if (leftLeft + center > clientX) {
			this.setLeftPercent(clientX);
			this.dragElement = this.subElements.left;
			return;
		}
	};

	onPointerUp = () => {
		this.element.classList.remove('range-slider_dragging');
		document.removeEventListener('pointermove', this.onPointerMove);
		document.removeEventListener('pointerup', this.onPointerUp);
		delete this.dragElement;
		this.dispatchSelect();
	};

	onPointerMove = event => {
		event.preventDefault();

		if (this.dragElement === this.subElements.left) {
			this.setLeftPercent(event.clientX);
		}

		if (this.dragElement === this.subElements.right) {
			this.setRightPercent(event.clientX);
		}
	};
}
