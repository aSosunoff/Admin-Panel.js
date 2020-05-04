import { TableInfinityServer } from '../../../common/table/table-infinity-server/index.js';

export class TableSales extends TableInfinityServer {
	constructor(headersConfig, { url = null, sorted, pageSize = 5, urlQueryPerem = {} } = {}) {
		super(headersConfig, {
			url,
			sorted,
			pageSize,
			urlQueryPerem,
		});
	}
}
