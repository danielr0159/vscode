/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSharedProcessRemoteService } from '../../ipc/electron-sandbox/services.js';
import { IWPBackendService } from '../common/wp-backend.js';
import { WPBackendChannelClient } from '../common/wp-backendIpc.js';

registerSharedProcessRemoteService(IWPBackendService, 'wp-backend', { channelClientCtor: WPBackendChannelClient });
