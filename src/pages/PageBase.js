import HTMLBulder from '../utils/HTMLBulder.js';
import subElementsFunc from '../utils/subElements.js';

export default class PageBase {
	element;
	subElements = {};
	components = {};

	get template() {
		return `<div>EMPTY</div>`;
	}

	constructor() {
		this.initComponents();
	}

	async renderComponents() {
		const promises = Object.values(this.components).map(item => item.render());
		const elements = await Promise.all(promises);
		Object.keys(this.components).forEach((component, index) => {
			this.subElements[component].append(elements[index]);
		});
	}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = subElementsFunc(this.element, '[data-element]');

		await this.renderComponents();

		return this.element;
	}

	initComponents() {
		throw new Error('Need override method');
	}

	destroy() {
		for (const component of Object.values(this.components)) {
			component.destroy();
		}
	}
}
