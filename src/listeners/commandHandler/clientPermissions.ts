import {
	DiscordenoMessage,
	NaticoCommand,
	CommandHandlerEvents,
} from '../../../deps.ts';
import { MacroListener } from '../../lib/extensions/mod.ts';
@globalThis.createEvent
export default class userpermissions extends MacroListener {
	constructor() {
		super('userpermissions', {
			emitter: 'commandHandler',
			event: CommandHandlerEvents.CLIENTPERMISSIONS,
		});
	}

	exec(
		message: DiscordenoMessage,
		command: NaticoCommand,
		_: string,
		missing: string[]
	) {
		try {
			message.reply(
				`**Im** missing the **${missing
					.map((x) => x.split('_').join(' ').toLowerCase())
					.join(', ')}** permissions to be able to run this command`
			);
		} catch (e) {}
		this.client.logger.command(message, command, 'user permissions');
	}
}
