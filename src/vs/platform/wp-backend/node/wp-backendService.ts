/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
import { IWPBackendService } from '../common/wp-backend.js';
import { ClaudeApiClient } from './claudeApiClient.js';

export class WPBackendService extends Disposable implements IWPBackendService {
	declare readonly _serviceBrand: undefined;

	private claudeApiClient: ClaudeApiClient | null = null;
	private initializationError: string | null = null;

	constructor(
		@ILogService private readonly logService: ILogService
	) {
		super();
		this.logService.trace('WPBackendService: created');

		try {
			this.claudeApiClient = new ClaudeApiClient(logService);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.logService.error(`WPBackendService: failed to initialize Claude API client: ${errorMessage}`);
			this.initializationError = errorMessage;
		}
	}

	async query(query: string): Promise<string> {
		this.logService.trace(`WPBackendService: received query: ${query}`);

		// Check if the client was initialized successfully
		if (!this.claudeApiClient) {
			this.logService.error(`WPBackendService: Claude API client is not initialized`);
			return `I'm unable to process your request because the Claude API client is not properly configured.
Error: ${this.initializationError || 'Unknown initialization error'}

Please check the configuration in claude-config.ts and ensure you have a valid API key.`;
		}

		try {
			// Send the query to Claude API
			const response = await this.claudeApiClient.query(query);
			this.logService.trace(`WPBackendService: received response from Claude API`);
			return response;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.logService.error(`WPBackendService: error querying Claude API: ${errorMessage}`);

			// Provide a more informative fallback response
			return `I encountered an issue while processing your request. This could be due to:
1. API key configuration issues
2. Network connectivity problems
3. Service unavailability

Please try again later or contact support if the problem persists.

Query received: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`;
		}
	}
}
