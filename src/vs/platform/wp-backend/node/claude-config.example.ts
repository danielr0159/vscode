/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Example configuration for Claude API
 *
 * To use:
 * 1. Copy this file to claude-config.ts
 * 2. Replace 'YOUR_API_KEY_HERE' with your actual Claude API key
 * 3. Adjust other settings as needed
 *
 * Note: claude-config.ts is added to .gitignore to prevent accidental commits of API keys
 */
export const claudeConfig = {
	/**
	 * Your Claude API key from Anthropic (https://console.anthropic.com/)
	 */
	apiKey: 'YOUR_API_KEY_HERE',

	/**
	 * Claude model to use
	 * Options include:
	 * - claude-3-7-sonnet-20250219 (recommended)
	 * - claude-3-5-sonnet-20240620
	 * - claude-3-opus-20240229
	 * - claude-3-haiku-20240307
	 * See https://docs.anthropic.com/en/api/models for the latest models
	 */
	model: 'claude-3-7-sonnet-20250219',

	/**
	 * Maximum number of tokens in the response
	 */
	maxTokens: 1024,

	/**
	 * Controls randomness: 0 = deterministic, 1 = maximum randomness
	 */
	temperature: 0.7,

	/**
	 * Claude API endpoint
	 */
	apiEndpoint: 'https://api.anthropic.com/v1/messages',

	/**
	 * API version
	 */
	apiVersion: '2023-06-01'
};
