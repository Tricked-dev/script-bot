import {
	DiscordenoMessage,
	NaticoCommand,
	CommandHandlerEvents,
} from '../../../deps.ts';
import { MacroListener } from '../../lib/extensions/mod.ts';
@globalThis.createEvent
export default class commandError extends MacroListener {
	constructor() {
		super('commandError', {
			emitter: 'commandHandler',
			event: CommandHandlerEvents.GUILDONLY,
		});
	}

	exec(message: DiscordenoMessage, command: NaticoCommand) {
		this.client.logger.command(message, command, 'guild only');
	}
}
