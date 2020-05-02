import header from './products-header.js';

import PageBase from '../../PageBase.js';
import TableInfinityServer from '../../../components/table/table-infinity-server/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page extends PageBase {
	/**@override*/
	get template() {
		return `
		<div class="products-list">
            <div class="content__top-panel">
                <h1 class="page-title">Товары</h1>
                <a href="/products/add" class="button-primary">Добавить товар</a>
            </div>
            <div class="content-box content-box_small"></div>
            <div data-element="productsContainer" class="products-list__container">
            </div>
		</div>`;
	}

	constructor() {
		super();
	}

	/** @override */
	initComponents() {
		const filter = {
			from: new Date(2000, 0, 1),
			to: new Date(2020, 1, 5),
		};

		const productsContainer = new TableInfinityServer(header, {
			url: new URL('api/rest/products', BACKEND_URL),
			pageSize: 15,
			filter,
			urlQueryPerem: {
				_embed: 'subcategory.category',
			},
		});

		this.components = {
			productsContainer,
		};
	}
}
