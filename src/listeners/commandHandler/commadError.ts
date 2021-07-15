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
			event: CommandHandlerEvents.COMMANDERROR,
		});
	}

	async exec(message: DiscordenoMessage, command: NaticoCommand, error: Error) {
		try {
			message
				.send({
					content:
						"A error occurred while trying to run that command, are you sure you're using it the right way?",
				})
				.catch(() => undefined);
			console.log(error);

			await this.client.logger.errorCommand(message, command, error);
		} catch (e) {
			console.log(e);
		}
	}
}
