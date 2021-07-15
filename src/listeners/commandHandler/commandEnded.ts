import {
	CommandHandlerEvents,
	DiscordenoMessage,
	NaticoCommand,
} from '../../../deps.ts';
import { MacroListener } from '../../lib/extensions/mod.ts';
@globalThis.createEvent
export default class commandEnded extends MacroListener {
	constructor() {
		super('commandEnded', {
			emitter: 'commandHandler',
			event: CommandHandlerEvents.COMMANDENDED,
		});
	}

	exec(message: DiscordenoMessage, command: NaticoCommand) {
		this.client.logger.command(message, command, 'ended');
	}
}
