//FRAMEWORK -
export * from '../framework/mod.ts';
export type { DiscordenoMessage as ddMessage } from '../framework/mod.ts';
export type { MacroMessage as DiscordenoMessage } from './src/lib/extensions/natico/MacroMessage.ts';

// SETTINGS
export { dbcon, tokens, botName } from './settings.ts';

//STD
export * from 'https://deno.land/std@0.97.0/fmt/colors.ts';

//EXTERNAL DEPS
export { Table } from 'https://deno.land/x/tbl@1.0.3/mod.ts';
export { Pool, PoolClient } from 'https://deno.land/x/postgres@v0.11.2/mod.ts';
export { EventEmitter } from 'https://deno.land/std@0.98.0/node/events.ts';

//COMMAND CREATIONG
type create = (t: any) => void;
declare global {
	var createCommand: create;
	var createEvent: create;
	var createInhibitor: create;
	var createTask: create;
}
