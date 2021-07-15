//FRAMEWORK -
export * from '../framework/mod.ts';
export type { DiscordenoMessage as ddMessage } from '../framework/mod.ts';
export type { MacroMessage as DiscordenoMessage } from './src/lib/extensions/natico/MacroMessage.ts';

// SETTINGS
export { dbcon, tokens, botName, suggestiononly } from './settings.ts';

//STD
export * from 'https://deno.land/std@0.97.0/fmt/colors.ts';
export {
	decode as base64Decode,
	encode as base64Encode,
} from 'https://deno.land/std@0.82.0/encoding/base64.ts';

//EXTERNAL DEPS
export { Table } from 'https://deno.land/x/tbl@1.0.3/mod.ts';
export { Pool, PoolClient } from 'https://deno.land/x/postgres@v0.11.2/mod.ts';
export { EventEmitter } from 'https://deno.land/std@0.98.0/node/events.ts';
export { default as Fuse } from 'https://deno.land/x/fuse@v6.4.1/dist/fuse.esm.min.js';
export { default as axiod } from 'https://deno.land/x/axiod@0.21/mod.ts';
export * from 'https://deno.land/x/imagescript@1.2.7/mod.ts';
export * from 'https://deno.land/x/drop@1.8.1/mod.ts';
export { default as uwufier } from 'https://unpkg.com/uwuifier@4.0.4/dist/index.js';

//CUSTOM STUFF
export {
	ENGLISH,
	filemap,
	responses,
} from 'https://raw.githubusercontent.com/malilbot/backend/92d4ecdfd20918e385e3506de1987b229a5544d4/mod.ts';

//COMMAND CREATIONG
type create = (t: any) => void;
declare global {
	var createCommand: create;
	var createEvent: create;
	var createInhibitor: create;
	var createTask: create;
}
