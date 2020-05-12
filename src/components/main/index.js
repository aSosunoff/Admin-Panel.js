import { HTMLBulder } from '../../utils/HTMLBulder.js';
import { getSubElements } from '../../utils/getSubElements.js';

export class MainPage {
	element;
	subElements = {};

	get template() {
		return `
		<div>
			<main class="main">
				<div class="progress-bar">
					<div class="progress-bar__line"></div>
				</div>
				<aside class="sidebar">
					<h2 class="sidebar__title">
						<a href="/">shop admin</a>
					</h2>
					<ul class="sidebar__nav">
						<li>
							<a href="/" data-page="dashboard">
								<i class="icon-dashboard"></i> <span>Панель управления</span>
							</a>
						</li>
						<li>
							<a href="/products" data-page="products">
								<i class="icon-products"></i> <span>Продукты</span>
							</a>
						</li>
						<li>
							<a href="/categories" data-page="categories">
								<i class="icon-categories"></i> <span>Категории</span>
							</a>
						</li>
						<li>
							<a href="/sales" data-page="sales"> <i class="icon-sales"></i> <span>Продажи</span> </a>
						</li>
					</ul>
					<ul class="sidebar__nav sidebar__nav_bottom">
						<li>
							<!-- TODO: implement toggling  -->
							<button type="button" class="sidebar__toggler" data-element="iconToggleSidebar">
								<i class="icon-toggle-sidebar"></i> <span>Скрыть панель</span>
							</button>
						</li>
					</ul>
				</aside>
				<section class="content" id="content"></section>
			</main>
			
			<div class="notification-container"></div>
		</div>`;
	}

	constructor() {}

	async render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = getSubElements(this.element, '[data-element]');

		this.initEventListeners();

		return this.element;
	}

	initEventListeners() {
		this.element.addEventListener('pointerdown', this.onToggleOpenClose);
	}

	removeEventListeners() {
		this.element.removeEventListener('pointerdown', this.onToggleOpenClose);
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.subElements = {};
	}

	toggleOpenClose() {
		document.body.classList.toggle('is-collapsed-sidebar');
	}

	onToggleOpenClose = ({ target, button }) => {
		let sidebarToggler = target.closest('.sidebar__toggler');

		if (button !== 0) {
			return;
		}

		if (sidebarToggler) {
			this.toggleOpenClose();
		}
	};
}
