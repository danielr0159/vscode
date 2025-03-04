/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { $, append, clearNode, addDisposableListener } from '../../../../base/browser/dom.js';
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

export class AskWidget extends Disposable {
	private readonly _onDidChangeHeight = this._register(new Emitter<number>());
	readonly onDidChangeHeight: Event<number> = this._onDidChangeHeight.event;

	private readonly _onDidFocus = this._register(new Emitter<void>());
	readonly onDidFocus: Event<void> = this._onDidFocus.event;

	private container!: HTMLElement;
	private messagesContainer!: HTMLElement;
	private inputContainer!: HTMLElement;
	private inputBox!: HTMLTextAreaElement;
	private sendButton!: Button;

	private messages: IAskMessage[] = [];
	private hardcodedResponse: string = "This is a hardcoded response from the Ask widget. You can customize this in the askWidget.ts file.";

	constructor(
		private readonly styles: IAskWidgetStyles,
	) {
		super();
	}

	render(parent: HTMLElement): void {
		this.container = append(parent, $('.ask-widget'));
		this.messagesContainer = append(this.container, $('.ask-messages'));
		this.inputContainer = append(this.container, $('.ask-input-container'));

		// Create input box
		this.inputBox = document.createElement('textarea');
		this.inputBox.placeholder = localize('askInputPlaceholder', "Type your question here...");
		this.inputBox.rows = 1;
		this.inputBox.className = 'ask-input';
		this.inputContainer.appendChild(this.inputBox);

		// Create send button
		this.sendButton = this._register(new Button(this.inputContainer, defaultButtonStyles));
		this.sendButton.label = localize('send', "Send");
		this.sendButton.element.classList.add('ask-send-button');

		// Register event listeners
		this._register(this.sendButton.onDidClick(() => this.sendMessage()));
		this._register(addDisposableListener(this.inputBox, 'keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage();
			}
		}));

		// Auto-resize textarea
		this._register(addDisposableListener(this.inputBox, 'input', () => {
			this.inputBox.style.height = 'auto';
			this.inputBox.style.height = `${Math.min(this.inputBox.scrollHeight, 150)}px`;
			this._onDidChangeHeight.fire(this.container.offsetHeight);
		}));

		this._register(addDisposableListener(this.inputBox, 'focus', () => {
			this._onDidFocus.fire();
		}));

		this.applyStyles();
	}

	private sendMessage(): void {
		const content = this.inputBox.value.trim();
		if (!content) {
			return;
		}

		// Add user message
		this.addMessage({
			content,
			isUser: true
		});

		// Clear input
		this.inputBox.value = '';
		this.inputBox.style.height = 'auto';
		this._onDidChangeHeight.fire(this.container.offsetHeight);

		// Simulate response (in a real implementation, this would call a service)
		setTimeout(() => {
			this.addMessage({
				content: this.hardcodedResponse,
				isUser: false
			});
		}, 500);
	}

	private addMessage(message: IAskMessage): void {
		this.messages.push(message);
		this.renderMessages();
	}

	private renderMessages(): void {
		clearNode(this.messagesContainer);

		for (const message of this.messages) {
			const messageElement = append(this.messagesContainer, $(`.ask-message${message.isUser ? '.user' : '.response'}`));
			messageElement.textContent = message.content;
		}

		// Scroll to bottom
		this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
		this._onDidChangeHeight.fire(this.container.offsetHeight);
	}

	private applyStyles(): void {
		if (this.container && this.styles) {
			this.container.style.color = this.styles.listForeground;
			this.container.style.backgroundColor = this.styles.listBackground;
			this.inputBox.style.backgroundColor = this.styles.inputBackground;
			this.inputBox.style.color = this.styles.inputForeground;
		}
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
		this.inputBox.focus();
	}
}
