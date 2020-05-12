import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';

import {
	NotificationSuccess,
	NotificationError,
	NotificationInfo,
} from './components/notification/notification/index.js';
import { NotificationManager } from './components/notification/notification-manager/index.js';

import { MainPage } from './components/main/index.js';

const render = async () => {
	const mainPage = new MainPage();
	
	const element = await mainPage.render();

	document.body.append(element);

	window.NotificationManager = new NotificationManager(
		{
			target: document.querySelector('.notification-container'),
		},
		{
			nameMethod: 'success',
			instance: new NotificationSuccess('Успех', 'Операция выполнена', {
				duration: 2000,
			}),
		},
		{
			nameMethod: 'error',
			instance: new NotificationError('Ошибка', 'Возникла ошибка', {
				isClose: true,
			}),
		},
		{
			nameMethod: 'info',
			instance: new NotificationInfo('Информация', 'Внимание', {
				duration: 2000,
			}),
		},
	);

	tooltip.initialize();

	const router = Router.instance();

	router
		.addRoute(/^$/, 'dashboard')
		.addRoute(/^products$/, 'products/list')
		.addRoute(/^products\/add$/, 'products/edit')
		.addRoute(/^products\/([\w()-]+)$/, 'products/edit')
		.addRoute(/^sales$/, 'sales')
		.addRoute(/^categories$/, 'categories')
		.addRoute(/^404\/?$/, 'error404')
		.setNotFoundPagePath('error404')
		.listen();
};

render();
