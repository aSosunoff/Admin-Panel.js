export class ComponentContainer {
	components = {};

	constructor() {}

	add(name, instance) {
		this.components[name] = instance;
		return this;
	}

	async renderComponents(callback) {
		const promises = Object.values(this.components).map(item => item.render());
		const elements = await Promise.all(promises);
		Object.keys(this.components).forEach((component, index) => {
			callback(component, elements[index]);
		});
	}

	destroy() {
		for (const component of Object.values(this.components)) {
			component.destroy();
		}
	}	
}
