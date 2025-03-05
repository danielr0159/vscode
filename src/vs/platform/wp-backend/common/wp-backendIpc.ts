/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.js';
import { IChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IWPBackendService } from './wp-backend.js';

export class WPBackendChannel implements IChannel {
	constructor(private service: IWPBackendService) { }

	listen(_: unknown, event: string): Event<any> {
		throw new Error(`Event not found: ${event}`);
	}

	call(_: unknown, command: string, arg?: any): Promise<any> {
		switch (command) {
			case 'query': return this.service.query(arg);
			default: throw new Error(`Call not found: ${command}`);
		}
	}
}

export class WPBackendChannelClient implements IWPBackendService {
	declare readonly _serviceBrand: undefined;

	constructor(private channel: IChannel) { }

	query(query: string): Promise<string> {
		return this.channel.call('query', query);
	}
}
