/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize2 } from '../../../../nls.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IViewContainersRegistry, Extensions as ViewContainerExtensions, ViewContainerLocation, IViewsRegistry } from '../../../common/views.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { AskViewPane } from './askViewPane.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerAction2, Action2, MenuId } from '../../../../platform/actions/common/actions.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';

// Define the Ask view container ID and view ID
export const ASK_VIEW_CONTAINER_ID = 'workbench.view.ask';
export const ASK_VIEW_ID = 'workbench.view.ask.tree';

// Register the Ask view container in the auxiliary bar (right panel)
const viewContainer = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
	id: ASK_VIEW_CONTAINER_ID,
	title: localize2('ask', "Ask"),
	icon: Codicon.question,
	order: 100,
	ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [ASK_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
	storageId: ASK_VIEW_CONTAINER_ID,
	hideIfEmpty: true,
}, ViewContainerLocation.AuxiliaryBar);

// Register the Ask view
Registry.as<IViewsRegistry>(ViewContainerExtensions.ViewsRegistry).registerViews([{
	id: ASK_VIEW_ID,
	name: localize2('ask', "Ask"),
	containerIcon: Codicon.question,
	canToggleVisibility: true,
	canMoveView: true,
	ctorDescriptor: new SyncDescriptor(AskViewPane),
	when: undefined,
	order: 100,
	focusCommand: {
		id: 'workbench.action.focusAskView'
	}
}], viewContainer);

// Register an action to open the Ask view
class OpenAskAction extends Action2 {
	static readonly ID = 'workbench.action.openAskView';
	static readonly LABEL = localize2('openAskView', "Open Ask View");

	constructor() {
		super({
			id: OpenAskAction.ID,
			title: OpenAskAction.LABEL,
			category: localize2('ask', "Ask"),
			f1: true,
			keybinding: {
				primary: 0,
				weight: 200
			},
			menu: {
				id: MenuId.CommandPalette
			}
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		await viewsService.openView(ASK_VIEW_ID, true);
	}
}

registerAction2(OpenAskAction);
