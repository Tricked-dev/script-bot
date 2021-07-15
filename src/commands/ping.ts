import { NaticoCommand, DiscordenoMessage } from '../../deps.ts';
@createCommand
export default class ping extends NaticoCommand {
	constructor() {
		super('ping', {
			name: 'ping',
			aliases: ['ping'],
		});
	}
	exec(message: DiscordenoMessage) {
		message.reply('Pong');
	}
}
