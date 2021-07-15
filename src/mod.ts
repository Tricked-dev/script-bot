import { MacroClient } from './lib/extensions/MacroClient.ts';
import { tokens } from '../deps.ts';
const macroClient = new MacroClient({
	intents: ['Guilds', 'GuildMessages', 'GuildVoiceStates'],
	token: tokens.token,
});
globalThis.createEvent = (t: any) => {
	const stackLines = new Error().stack!.split('\n');
	const path = `file:${stackLines[2].split(':')[1]}`;
	macroClient.listenerHandler.register(new t(), path);
};
globalThis.createCommand = (t: any) => {
	const stackLines = new Error().stack!.split('\n');
	const path = `file:${stackLines[2].split(':')[1]}`;
	macroClient.commandHandler.register(new t(), path);
};
globalThis.createInhibitor = (t: any) => {
	const stackLines = new Error().stack!.split('\n');
	const path = `file:${stackLines[2].split(':')[1]}`;
	macroClient.inhibitorHandler.register(new t(), path);
};
globalThis.createTask = (t: any) => {
	const stackLines = new Error().stack!.split('\n');
	const path = `file:${stackLines[2].split(':')[1]}`;
	macroClient.taskHandler.register(new t(), path);
};
macroClient.start();
