import { NotificationMessage } from '../notification/index.js';

export class NotificationManager {
	target;
	stackLimit;
	notificationsList;

	constructor({ target = document.body, stackLimit = 4 } = {}, ...notifications) {
		this.target = target;
		this.stackLimit = stackLimit;
		this.notificationsList = [];

		notifications.forEach(e => {
			const { nameMethod, defaultSetting } = e;

			if (!nameMethod) {
				throw new Error('You need set name method');
			}

			if (!defaultSetting) {
				throw new Error('You need set default instance');
			}

			if (!(defaultSetting instanceof NotificationMessage)) {
				throw new Error('Notification is not extends from NotificationMessage');
			}

			const {
				title: titleDefault,
				message: messageDefault,
				duration: durationDefault,
				isClose: isCloseDefault,
			} = defaultSetting;

			this[nameMethod] = (
				title = titleDefault,
				message = messageDefault,
				{ duration = durationDefault, isClose = isCloseDefault } = {},
			) => {
				const notification = new defaultSetting.constructor(title, message, { duration, isClose });

				notification.show(this.target);

				if (this.notificationsList.length >= this.stackLimit) {
					this.notificationsList.shift().destroy();
				}

				if (!isClose) {
					this.notificationsList.push(notification);
				}
			};
		});
	}

	destroy() {
		this.notificationsList = [];
	}
}
