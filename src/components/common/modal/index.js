import { HTMLBulder } from '../../../utils/HTMLBulder.js';
import { getSubElements } from '../../../utils/getSubElements.js';

export class Modal {
	element;
	subElements = {};
	title;

	get template() {
		return `
		<div class="modal-background">
			<div class="modal-background__container" data-element="container">
				<div class="modal-background__header">
					<div class="modal-background__title" data-element="title"></div>
					<div class="modal-background__close"></div>
				</div>
				<div class="modal-background__body"></div>
			</div>
		</div>`;
	}

	constructor({ title = '' } = {}) {
		this.title = title;
	}

	open() {
		document.body.append(this.element);
		document.addEventListener('click', this.onClose, true);
	}

	close() {
		this.remove();
	}

	dispatchEvent() {
		/* this.element.dispatchEvent(
			new CustomEvent('date-range-selected', {
				detail: this.selected,
				bubbles: true,
			}),
		); */
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);
		this.subElements = getSubElements(this.element, '[data-element]');
		this.update();
		this.initEventListeners();
		return this.element;
	}

	update({ title = this.title } = {}) {
		this.title = title;
		this.subElements.title.textContent = this.title;
	}

	initEventListeners() {
		/* this.element.addEventListener('click', this.onControllRight, true);
		this.element.addEventListener('click', this.onControllLeft, true);
		this.element.addEventListener('click', this.onDayClick);
		document.addEventListener('click', this.onClose, true); */
	}

	removeEventListeners() {
		/* this.element.removeEventListener('click', this.onControllRight, true);
		this.element.removeEventListener('click', this.onControllLeft, true);
		this.element.removeEventListener('click', this.onDayClick);
		document.removeEventListener('click', this.onClose, true); */
	}

	remove() {
		this.element.remove();
		document.removeEventListener('click', this.onClose, true);
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.element = null;
		this.subElements = {};
	}

	/* onOpen = ({ target }) => {
		if (!target.closest('.rangepicker')) {
			this.close();
		}
	}; */

	onClose = ({ target }) => {
		if (
			!target.closest('.modal-background__container') ||
			target.closest('.modal-background__close')
		) {
			this.close();
		}
	};
}
