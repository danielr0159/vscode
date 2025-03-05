/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { $, append, addDisposableListener } from '../../../../base/browser/dom.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { defaultButtonStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { localize } from '../../../../nls.js';

export interface IAskWidgetStyles {
	listForeground: string;
	listBackground: string;
	inputBackground: string;
	inputForeground: string;
}

export interface IAskMessage {
	content: string;
	isUser: boolean;
}

interface IConversationEntry {
	question: string;
	answer?: string;
	questionElement?: HTMLElement;
	questionInputBox?: HTMLTextAreaElement;
	questionSendButton?: Button;
	answerElement?: HTMLElement;
}

export class AskWidget extends Disposable {
	private readonly _onDidChangeHeight = this._register(new Emitter<number>());
	readonly onDidChangeHeight: Event<number> = this._onDidChangeHeight.event;

	private readonly _onDidFocus = this._register(new Emitter<void>());
	readonly onDidFocus: Event<void> = this._onDidFocus.event;

	private container!: HTMLElement;
	private chatHistoryContainer!: HTMLElement;
	private currentInputContainer!: HTMLElement;
	private currentInputBox!: HTMLTextAreaElement;
	private currentSendButton!: Button;

	private conversationEntries: IConversationEntry[] = [];
	private hardcodedResponse: string = "This is a hardcoded response from the Ask widget. You can customize this in the askWidget.ts file.";

	constructor(
		private readonly styles: IAskWidgetStyles,
	) {
		super();
	}

	render(parent: HTMLElement): void {
		this.container = append(parent, $('.ask-widget'));

		// Create chat history container
		this.chatHistoryContainer = append(this.container, $('.ask-chat-history'));

		// Style the scrollbar
		this.styleScrollbar(this.chatHistoryContainer);

		// Create the initial input box at the bottom
		this.createNewInputBox();

		this.applyStyles();
	}

	private createNewInputBox(): void {
		// Create a new input container
		this.currentInputContainer = append(this.chatHistoryContainer, $('.ask-input-container'));

		// Create input box
		this.currentInputBox = document.createElement('textarea');
		this.currentInputBox.placeholder = localize('askInputPlaceholder', "Type your question here...");
		this.currentInputBox.rows = 4; // Set to approximately 4 lines of text
		this.currentInputBox.className = 'ask-input';
		this.currentInputContainer.appendChild(this.currentInputBox);

		// Create send button
		this.currentSendButton = this._register(new Button(this.currentInputContainer, defaultButtonStyles));
		this.currentSendButton.label = localize('send', "Send");
		this.currentSendButton.element.classList.add('ask-send-button');

		// Register event listeners
		this._register(this.currentSendButton.onDidClick(() => this.sendMessage()));
		this._register(addDisposableListener(this.currentInputBox, 'keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage();
			}
		}));

		// Auto-resize textarea
		this._register(addDisposableListener(this.currentInputBox, 'input', () => {
			this.currentInputBox.style.height = 'auto';
			this.currentInputBox.style.height = `${Math.min(this.currentInputBox.scrollHeight, 200)}px`;
			this._onDidChangeHeight.fire(this.container.offsetHeight);
		}));

		this._register(addDisposableListener(this.currentInputBox, 'focus', () => {
			this._onDidFocus.fire();
		}));

		// Style the new input box and button
		this.styleInputBox(this.currentInputBox, this.currentSendButton);

		// Focus the new input box
		this.currentInputBox.focus();

		// Scroll to the bottom to show the new input box
		setTimeout(() => {
			this.chatHistoryContainer.scrollTop = this.chatHistoryContainer.scrollHeight;
		}, 0);
	}

	private sendMessage(): void {
		const content = this.currentInputBox.value.trim();
		if (!content) {
			return;
		}

		// Store references to current elements
		const questionInputBox = this.currentInputBox;
		const questionSendButton = this.currentSendButton;
		const questionContainer = this.currentInputContainer;

		// Disable the current input box and button
		questionInputBox.disabled = true;
		questionSendButton.enabled = false;

		// Store the question
		const entry: IConversationEntry = {
			question: content,
			questionElement: questionContainer,
			questionInputBox: questionInputBox,
			questionSendButton: questionSendButton
		};
		this.conversationEntries.push(entry);

		// Optimize the question box appearance
		this.optimizeQuestionBox(entry);

		// Create an answer container
		const answerContainer = append(this.chatHistoryContainer, $('.ask-answer-container'));
		answerContainer.style.marginLeft = '12px'; // Reduced horizontal margin by 20%
		answerContainer.style.marginTop = '8px';
		answerContainer.style.marginBottom = '16px';

		entry.answerElement = answerContainer;

		this._onDidChangeHeight.fire(this.container.offsetHeight);

		// Simulate response (in a real implementation, this would call a service)
		setTimeout(() => {
			answerContainer.textContent = this.hardcodedResponse;
			entry.answer = this.hardcodedResponse;

			// Create a new input box AFTER the answer is shown
			setTimeout(() => {
				this.createNewInputBox();

				// Scroll to the bottom to show the new input box
				this.chatHistoryContainer.scrollTop = this.chatHistoryContainer.scrollHeight;
				this._onDidChangeHeight.fire(this.container.offsetHeight);
			}, 100);
		}, 500);
	}

	private optimizeQuestionBox(entry: IConversationEntry): void {
		if (!entry.questionInputBox || !entry.questionSendButton || !entry.questionElement) {
			return;
		}

		const inputBox = entry.questionInputBox;
		const sendButton = entry.questionSendButton;

		// 1. Remove the send button as it's no longer needed
		sendButton.element.style.display = 'none';

		// 2. Adjust the input box to fit its content exactly
		// First, store the original background color to preserve it
		const originalBgColor = inputBox.style.backgroundColor;

		// Temporarily remove min-height to get accurate scrollHeight
		inputBox.style.minHeight = 'unset';

		// Set height to auto and then to scrollHeight to fit content exactly
		inputBox.style.height = 'auto';
		inputBox.style.height = `${inputBox.scrollHeight}px`;

		// Restore the original background color (in case it was changed)
		inputBox.style.backgroundColor = originalBgColor;

		// Update the height
		this._onDidChangeHeight.fire(this.container.offsetHeight);
	}

	private styleInputBox(inputBox: HTMLTextAreaElement, sendButton: Button): void {
		if (!this.styles) {
			return;
		}

		const inputContainer = inputBox.parentElement;
		if (!inputContainer) {
			return;
		}

		// Style the input container
		inputContainer.style.position = 'relative';
		inputContainer.style.padding = '12px'; // Reduced horizontal margin by 20%
		inputContainer.style.marginBottom = '8px';

		// Style the input box
		inputBox.style.width = '100%';
		inputBox.style.backgroundColor = this.styles.inputBackground;
		inputBox.style.color = this.styles.inputForeground;
		inputBox.style.borderRadius = '8px';
		inputBox.style.padding = '12px';
		inputBox.style.paddingRight = '60px'; // Make room for the send button
		inputBox.style.boxSizing = 'border-box';
		inputBox.style.resize = 'none';
		inputBox.style.border = 'none';
		inputBox.style.outline = 'none';
		inputBox.style.minHeight = '100px'; // Approximately 4 lines of text

		// Calculate a lighter background color for the input
		const inputBgColor = this.styles.inputBackground;
		const lighterInputBgColor = this.lightenColor(inputBgColor, 0.1);
		inputBox.style.backgroundColor = lighterInputBgColor;

		// Style the send button
		const buttonElement = sendButton.element;
		buttonElement.style.position = 'absolute';
		buttonElement.style.right = '20px'; // Reduced horizontal margin by 20%
		buttonElement.style.bottom = '20px'; // Reduced vertical margin by 20%
		buttonElement.style.borderRadius = '4px';
		buttonElement.style.padding = '4px 8px';
		buttonElement.style.width = '10%';
		buttonElement.style.minWidth = '60px';
		buttonElement.style.maxWidth = '80px';
		buttonElement.style.textAlign = 'center';

		// Calculate an even lighter color for the button
		const lighterButtonBgColor = this.lightenColor(inputBgColor, 0.2);
		buttonElement.style.backgroundColor = lighterButtonBgColor;

		// Override any default button styles
		buttonElement.style.border = 'none';
		buttonElement.style.cursor = 'pointer';
		buttonElement.style.fontSize = '12px';
		buttonElement.style.fontWeight = 'bold';
	}

	private styleScrollbar(element: HTMLElement): void {
		// Modern, sleek scrollbar styling
		element.style.scrollbarWidth = 'thin'; // For Firefox
		element.style.scrollbarColor = 'rgba(100, 100, 100, 0.5) rgba(0, 0, 0, 0.1)'; // For Firefox

		// For Webkit browsers (Chrome, Safari, Edge)
		const styleSheet = document.createElement('style');
		styleSheet.textContent = `
			.ask-chat-history::-webkit-scrollbar {
				width: 6px;
				height: 6px;
			}
			.ask-chat-history::-webkit-scrollbar-track {
				background: rgba(0, 0, 0, 0.1);
				border-radius: 3px;
			}
			.ask-chat-history::-webkit-scrollbar-thumb {
				background: rgba(100, 100, 100, 0.5);
				border-radius: 3px;
			}
			.ask-chat-history::-webkit-scrollbar-thumb:hover {
				background: rgba(100, 100, 100, 0.7);
			}
		`;
		document.head.appendChild(styleSheet);
		this._register({
			dispose: () => {
				document.head.removeChild(styleSheet);
			}
		});
	}

	private applyStyles(): void {
		if (this.container && this.styles) {
			// Apply container styles
			this.container.style.color = this.styles.listForeground;
			this.container.style.backgroundColor = this.styles.listBackground;
			this.container.style.display = 'flex';
			this.container.style.flexDirection = 'column';
			this.container.style.height = '100%';

			// Style the chat history container
			this.chatHistoryContainer.style.flex = '1';
			this.chatHistoryContainer.style.overflow = 'auto';
			this.chatHistoryContainer.style.padding = '6px 12px'; // Reduced horizontal margin by 20%

			// Style any existing input boxes
			if (this.currentInputBox && this.currentSendButton) {
				this.styleInputBox(this.currentInputBox, this.currentSendButton);
			}
		}
	}

	// Helper function to lighten a color
	private lightenColor(color: string, amount: number): string {
		// Simple implementation for hex colors
		if (color.startsWith('#')) {
			let r = parseInt(color.slice(1, 3), 16);
			let g = parseInt(color.slice(3, 5), 16);
			let b = parseInt(color.slice(5, 7), 16);

			r = Math.min(255, Math.round(r + (255 - r) * amount));
			g = Math.min(255, Math.round(g + (255 - g) * amount));
			b = Math.min(255, Math.round(b + (255 - b) * amount));

			return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		}

		// For non-hex colors, just return the original
		return color;
	}


	layout(height: number, width: number): void {
		if (this.container) {
			this.container.style.height = `${height}px`;
			this.container.style.width = `${width}px`;
		}
	}

	setVisible(visible: boolean): void {
		if (this.container) {
			this.container.style.display = visible ? 'flex' : 'none';
		}
	}

	focus(): void {
		this.focusInput();
	}

	focusInput(): void {
		if (this.currentInputBox) {
			this.currentInputBox.focus();
		}
	}
}
