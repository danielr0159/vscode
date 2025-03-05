/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../instantiation/common/instantiation.js';

export const IWPBackendService = createDecorator<IWPBackendService>('wpBackendService');

/**
 * Service interface for the WP Backend service
 */
export interface IWPBackendService {
	readonly _serviceBrand: undefined;

	/**
	 * Query the WP backend with a JSON query
	 * @param query The query to send to the backend
	 */
	query(query: string): Promise<string>;
}
