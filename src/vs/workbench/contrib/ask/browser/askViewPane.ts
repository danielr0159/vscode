/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { AskWidget } from './askWidget.js';
import { SIDE_BAR_BACKGROUND, SIDE_BAR_FOREGROUND } from '../../../common/theme.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { inputForeground } from '../../../../platform/theme/common/colors/inputColors.js';

export class AskViewPane extends ViewPane {
	private _widget!: AskWidget;
	get widget(): AskWidget { return this._widget; }

	constructor(
		options: IViewPaneOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
	}

	protected getBackgroundColor(): string {
		return this.themeService.getColorTheme().getColor(SIDE_BAR_BACKGROUND)?.toString() || '';
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);

		this._widget = this._register(this.instantiationService.createInstance(
			AskWidget,
			{
				listForeground: SIDE_BAR_FOREGROUND,
				listBackground: this.getBackgroundColor(),
				inputBackground: this.getBackgroundColor(),
				inputForeground: this.themeService.getColorTheme().getColor(inputForeground)?.toString() || 'white'
			}
		));

		this._widget.render(container);
		this._register(this._widget.onDidChangeHeight(() => this.layoutBody()));
	}

	override focus(): void {
		super.focus();
		this._widget.focusInput();
	}

	protected override layoutBody(height: number = this.element.clientHeight, width: number = this.element.clientWidth): void {
		super.layoutBody(height, width);
		this._widget.layout(height, width);
	}
}
