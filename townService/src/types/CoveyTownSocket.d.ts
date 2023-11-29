import { BroadcastOperator, Socket } from 'socket.io';
/* eslint-disable import/no-relative-packages */
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types/CoveyTownSocket';
/* eslint-disable import/no-relative-packages */
export * from '../../../shared/types/CoveyTownSocket';

export type SocketData = Record<string, never>;
export type CoveyTownSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type TownEmitter = BroadcastOperator<ServerToClientEvents, SocketData>;
export type TownEmitterFactory = (townID: string) => TownEmitter;
