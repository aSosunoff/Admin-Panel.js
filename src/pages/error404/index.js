import { HTMLBulder } from '../../utils/HTMLBulder.js';

export default class {
	async render() {
		return HTMLBulder.getElementFromString(`
		<div class="error-404">
			<h1 class="page-title">Страница не найдена</h1>
			<p>Извините, страница не существует</p>
		</div>`);
	}
}
