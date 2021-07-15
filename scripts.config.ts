import { DenonConfig } from 'https://deno.land/x/denon/mod.ts';
import { tokens } from './settings.ts';
const config: DenonConfig = {
	env: {
		TOKEN: tokens.dev,
		PREFIX: '!',
	},
	watcher: {
		skip: ['fileloader.ts', 'data.json'],
	},
	scripts: {
		start: {
			cmd: 'deno run -A --unstable --no-check src/mod.ts',
			desc: 'Runs the bot',
		},
	},
};
export default config;
