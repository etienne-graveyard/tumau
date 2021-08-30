/// <reference types="node" />
import { TumauRequest } from './TumauRequest';
import { ServerResponse } from 'http';
import { Duplex } from 'stream';
export declare const RequestContext: import("miid").Context<TumauRequest, true>;
export declare const RequestConsumer: import("miid").ContextConsumer<TumauRequest, true>;
export declare const ServerResponseContext: import("miid").Context<ServerResponse, false>;
export declare const ServerResponseConsumer: import("miid").ContextConsumer<ServerResponse, false>;
export declare const UpgradeSocketContext: import("miid").Context<Duplex, false>;
export declare const UpgradeSocketConsumer: import("miid").ContextConsumer<Duplex, false>;
export declare const UpgradeHeadContext: import("miid").Context<Buffer, false>;
export declare const UpgradeHeadConsumer: import("miid").ContextConsumer<Buffer, false>;
export declare const DebugContext: import("miid").Context<boolean, true>;
export declare const DebugConsumer: import("miid").ContextConsumer<boolean, true>;
