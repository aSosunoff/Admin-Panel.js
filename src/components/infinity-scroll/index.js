import { debounceDecorator } from '../../utils/debounceDecorator.js';

export class InfinityScroll {
	get checkBottomBorder() {
		const { bottom } = document.documentElement.getBoundingClientRect();
		const { clientHeight } = document.documentElement;
		return bottom < clientHeight + 100;
	}

	constructor(element) {
		this.element = element;
		this.onScroll = debounceDecorator(this.onScroll, 100);
		this.render();
	}

	render() {
		this.initEventListeners();
	}

	dispatchEvent() {
		this.element.dispatchEvent(
			new CustomEvent("infinity-scroll", {
				bubbles: true,
			})
		);
	}

	initEventListeners() {
		document.addEventListener("scroll", this.onScroll);
	}

	removeEventListeners() {
		document.removeEventListener("scroll", this.onScroll);
	}

	destroy() {
		this.removeEventListeners();
	}

	onScroll = () => {
		if (this.checkBottomBorder) {
			this.dispatchEvent();
		}
	};
}
