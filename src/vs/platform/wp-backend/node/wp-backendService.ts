/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
import { IWPBackendService } from '../common/wp-backend.js';

export class WPBackendService extends Disposable implements IWPBackendService {
	declare readonly _serviceBrand: undefined;

	constructor(
		@ILogService private readonly logService: ILogService
	) {
		super();
		this.logService.trace('WPBackendService: created');
	}

	async query(query: string): Promise<string> {
		this.logService.trace(`WPBackendService: received query: ${query}`);

		// For now, just return a hardcoded response
		return `This is a response from the WP Backend service for query: ${query}`;
	}
}
