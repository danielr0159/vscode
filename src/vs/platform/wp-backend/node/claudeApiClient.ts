/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { claudeConfig } from './claude-config.js';
import { ILogService } from '../../log/common/log.js';
import * as https from 'https';
import { URL } from 'url';

/**
 * Client for interacting with Claude API
 */
export class ClaudeApiClient {
	constructor(
		private readonly logService: ILogService
	) {
		this.logService.trace('ClaudeApiClient: created');

		// Validate API key format
		this.validateApiKey();
	}

	/**
	 * Validate the API key format
	 * @throws Error if the API key is not set or has an invalid format
	 */
	private validateApiKey(): void {
		if (!claudeConfig.apiKey || claudeConfig.apiKey === 'YOUR_API_KEY_HERE') {
			this.logService.error('ClaudeApiClient: API key is not configured');
			throw new Error('Claude API key is not configured. Please set a valid API key in claude-config.ts');
		}

		// Check if the API key has a valid format (typically starts with 'sk-')
		if (!claudeConfig.apiKey.startsWith('sk-')) {
			this.logService.warn('ClaudeApiClient: API key may have an invalid format (should start with "sk-")');
		}
	}

	/**
	 * Send a query to Claude API
	 * @param query The query to send to Claude
	 * @returns A promise that resolves to the response from Claude
	 */
	async query(query: string): Promise<string> {
		this.logService.trace(`ClaudeApiClient: sending query to Claude API: ${query}`);

		try {
			const response = await this.makeRequest(query);
			this.logService.trace(`ClaudeApiClient: received response from Claude API`);
			return response;
		} catch (error) {
			this.logService.error(`ClaudeApiClient: error querying Claude API: ${error}`);
			throw error;
		}
	}

	/**
	 * Make a request to the Claude API
	 * @param query The query to send
	 * @returns A promise that resolves to the response text
	 */
	private makeRequest(query: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const url = new URL(claudeConfig.apiEndpoint);

			const requestData = JSON.stringify({
				model: claudeConfig.model,
				max_tokens: claudeConfig.maxTokens,
				temperature: claudeConfig.temperature,
				messages: [
					{
						role: 'user',
						content: query
					}
				]
			});

			const options = {
				hostname: url.hostname,
				path: url.pathname,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': claudeConfig.apiKey,
					'anthropic-version': claudeConfig.apiVersion,
					'Content-Length': Buffer.byteLength(requestData)
				}
			};

			const req = https.request(options, (res) => {
				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {
					if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
						try {
							const parsedData = JSON.parse(data);

							// Extract the content from the response
							// The Claude API response structure has a 'content' array in the first message of the 'messages' array
							if (parsedData.content && Array.isArray(parsedData.content)) {
								// Direct content array in response (older API version)
								const responseText = parsedData.content
									.filter((item: any) => item.type === 'text')
									.map((item: any) => item.text)
									.join('\n');
								resolve(responseText);
							} else if (parsedData.messages && parsedData.messages.length > 0 && parsedData.messages[0].content) {
								// Content in messages array (newer API version)
								const content = parsedData.messages[0].content;
								if (Array.isArray(content)) {
									const responseText = content
										.filter((item: any) => item.type === 'text')
										.map((item: any) => item.text)
										.join('\n');
									resolve(responseText);
								} else if (typeof content === 'string') {
									resolve(content);
								} else {
									reject(new Error('Unexpected content format in Claude API response'));
								}
							} else if (parsedData.completion) {
								// Legacy API format with 'completion' field
								resolve(parsedData.completion);
							} else {
								this.logService.error('Unexpected Claude API response format');
								reject(new Error('Unexpected Claude API response format'));
							}
						} catch (error) {
							reject(new Error(`Failed to parse Claude API response: ${error}`));
						}
					} else {
						try {
							// Try to parse the error response for more details
							const errorData = JSON.parse(data);

							if (errorData.error) {
								const errorType = errorData.error.type || 'unknown';
								const errorMessage = errorData.error.message || 'Unknown error';

								// Handle specific error types
								if (errorType === 'authentication_error') {
									this.logService.error(`Claude API authentication error: ${errorMessage}`);
									reject(new Error('API key is invalid or missing. Please check your configuration.'));
								} else if (errorType === 'rate_limit_error') {
									this.logService.error(`Claude API rate limit error: ${errorMessage}`);
									reject(new Error('Rate limit exceeded. Please try again later.'));
								} else if (errorType === 'invalid_request_error') {
									this.logService.error(`Claude API invalid request: ${errorMessage}`);
									reject(new Error(`Invalid request: ${errorMessage}`));
								} else {
									this.logService.error(`Claude API error (${errorType}): ${errorMessage}`);
									reject(new Error(`Claude API error: ${errorMessage}`));
								}
							} else {
								reject(new Error(`Claude API request failed with status code ${res.statusCode}: ${data}`));
							}
						} catch (parseError) {
							// If we can't parse the error as JSON, just return the raw error
							reject(new Error(`Claude API request failed with status code ${res.statusCode}: ${data}`));
						}
					}
				});
			});

			req.on('error', (error) => {
				reject(new Error(`Claude API request error: ${error.message}`));
			});

			req.write(requestData);
			req.end();
		});
	}
}
