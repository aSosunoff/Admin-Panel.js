import { TableServer } from '../table-server/index.js';
import { InfinityScroll } from '../../infinity-scroll/index.js';

export class TableInfinityServer extends TableServer {
	infinityElement;

	constructor(headersConfig, { url = null, sorted, pageSize = 5, urlQueryPerem = {} } = {}) {
		super(headersConfig, {
			url,
			sorted,
			pageSize,
			urlQueryPerem,
		});
	}

	/**@override*/
	initEventListeners() {
		this.infinityElement = new InfinityScroll(this.element);
		this.element.addEventListener('infinity-scroll', this.onNextPageByInfinity);
		super.initEventListeners();
	}

	/**@override*/
	removeEventListeners() {
		this.element.removeEventListener('infinity-scroll', this.onNextPageByInfinity);
		super.removeEventListeners();
	}

	/**@override*/
	destroy() {
		this.infinityElement.destroy();
		this.infinityElement = null;
		super.destroy();
	}

	onNextPageByInfinity = () => {
		this.renderNextPage();
	}
}
