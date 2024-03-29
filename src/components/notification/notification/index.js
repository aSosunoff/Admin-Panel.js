import { HTMLBulder } from '../../../utils/HTMLBulder.js';

export class NotificationMessage {
	element;
	duration;
	type;
	message;
	title;
	isClose;
	timer = null;

	get template() {
		return `
		<div 
			class="notification 
			${this.type} 
			${!this.isClose ? 'notification-fade-out' : ''}" 
			style="--value: ${this.duration}ms;">
			${!this.isClose ? '<div class="timer"></div>' : ''}
				<div class="inner-wrapper">
					<div class="notification-header">
						${this.title}
						${this.isClose ? '<span class="close">×</span>' : ''}
					</div>
					<div class="notification-body">${this.message}</div>
				</div>
		</div>`;
	}

	constructor(title, message, { duration = 1000, type = 'success', isClose = false } = {}) {
		this.title = title;
		this.duration = duration;
		this.type = type;
		this.message = message;
		this.isClose = isClose;
		this.element = HTMLBulder.getElementFromString(this.template);
	}

	show(target = document.body) {
		target.append(this.element);

		if (this.isClose) {
			this.element.addEventListener('click', this.onClickRemove);
			return;
		}

		clearTimeout(this.timer);

		this.timer = setTimeout(() => {
			this.remove();
		}, this.duration);
	}

	remove() {
		this.element.removeEventListener('click', this.onClickRemove);
		this.element.remove();
		clearTimeout(this.timer);
		this.timer = null;
	}

	destroy() {
		this.remove();
	}

	onClickRemove = e => {
		if (!e.target.closest('.close')) {
			return;
		}

		this.remove();
	};
}

export class NotificationSuccess extends NotificationMessage {
	constructor(title = '', message = '', { duration, isClose } = {}) {
		super(title, message, { duration, isClose, type: 'success' });
	}
}

export class NotificationInfo extends NotificationMessage {
	constructor(title = '', message = '', { duration, isClose } = {}) {
		super(title, message, { duration, isClose, type: 'info' });
	}
}

export class NotificationError extends NotificationMessage {
	constructor(title = '', message = '', { duration, isClose } = {}) {
		super(title, message, { duration, isClose, type: 'error' });
	}
}
