import { DiscordenoMessage, NaticoCommand } from '../../../deps.ts';
import { MacroListener } from '../../lib/extensions/mod.ts';
@globalThis.createEvent
export default class commandStarted extends MacroListener {
	constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted',
		});
	}

	exec(message: DiscordenoMessage, command: NaticoCommand) {
		this.client.logger.command(message, command, 'started');
	}
}
