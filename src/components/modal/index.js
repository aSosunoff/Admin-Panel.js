import { HTMLBulder } from '../../utils/HTMLBulder.js';
import { getSubElements } from '../../utils/getSubElements.js';

export class Modal {
	element;
	subElements = {};
	title;
	body;
	static count = 0;

	get template() {
		return `
		<div>
			<div class="modal-background" data-element="modal">
				<div class="modal-background__container" data-element="container">
					<div class="modal-background__header">
						<div class="modal-background__title" data-element="title"></div>
						<div class="modal-background__close"></div>
					</div>
					<div data-element="body"></div>
				</div>
			</div>
		</div>`;
	}

	constructor({ title = '', body = '' } = {}) {
		this.title = title;
		this.body = body;
		Modal.count++;
	}

	open() {
		document.body.style.overflow = 'hidden';
		this.element.innerHTML = '';
		this.element.append(this.subElements.modal);
		this.initEventListeners();
	}

	close() {
		document.body.style.overflow = '';
		this.subElements.modal.remove();
		this.element.dispatchEvent(
			new CustomEvent('modal-close', {
				detail: this,
				bubbles: true,
			}),
		);
		this.removeEventListeners();
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);
		this.element.classList.add(`modal-${Modal.count}`);
		this.subElements = getSubElements(this.element, '[data-element]');
		this.close();
		this.update();
		this.initEventListeners();
		return this.element;
	}

	update({ title = this.title, body = this.body } = {}) {
		this.title = title;
		this.body = body;
		
		this.subElements.title.textContent = this.title;

		if (this.body instanceof HTMLElement) {
			this.subElements.body.innerHTML = '';
			this.subElements.body.append(this.body);
		} else if (typeof this.body === "string") {
			this.subElements.body.innerHTML = this.body;
		}
	}

	initEventListeners() {
		document.addEventListener('click', this.onClose, true);
	}

	removeEventListeners() {
		document.removeEventListener('click', this.onClose, true);
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.element = null;
		this.subElements = {};
		this.title = '';
		this.body = '';
	}

	onClose = ({ target }) => {
		if (
			!target.closest('.modal-background__container') ||
			target.closest('.modal-background__close')
		) {
			this.close();
		}
	};
}
