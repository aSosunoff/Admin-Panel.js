class Tooltip {
	static instance;

	options = {};
	element;

	constructor() {
		if (Tooltip.instance) {
			return Tooltip.instance;
		}

		Tooltip.instance = this;
	}

	showTooltip(text) {
		this.element = document.createElement(this.options.tag);
		this.element.className = this.options.className;
		this.element.innerHTML = text;
		document.body.append(this.element);
	}

	initEventListeners() {
		document.addEventListener('pointerover', this.onPointerOver);
	}

	initialize({ className = 'tooltip', tag = 'div' } = {}) {
		this.options = {
			className,
			tag,
		};

		this.initEventListeners();
	}

	render(text) {
		this.showTooltip(text);
	}

	destroy() {
		if (this.element) {
			this.element.remove();
			this.element = null;
		}
		document.removeEventListener('pointerover', this.onPointerOver);
	}

	onPointerOver = e => {
		const spaceTooltip = e.target.closest('[data-tooltip]');
		if (!spaceTooltip) {
			return;
		}
		this.showTooltip(spaceTooltip.dataset.tooltip);
		document.addEventListener('pointermove', this.onPointerMove);
		document.addEventListener('pointerout', this.onPointerOut);
	};

	onPointerOut = () => {
		if (!this.element) {
			return;
		}
		this.element.remove();
		this.element = null;
		document.removeEventListener('pointermove', this.onPointerMove);
		document.removeEventListener('pointerout', this.onPointerOut);
	};

	onPointerMove = e => {
		let newX = e.clientX + 10;
		let newY = e.clientY + 10;

		if (newX + this.element.offsetWidth > document.documentElement.clientWidth) {
			newX = document.documentElement.clientWidth - this.element.offsetWidth;
		}

		if (newY + this.element.offsetHeight > document.documentElement.clientHeight) {
			newY = document.documentElement.clientHeight - this.element.offsetHeight;
		}

		this.element.style.left = `${newX}px`;
		this.element.style.top = `${newY}px`;
	};
}

export default new Tooltip();
