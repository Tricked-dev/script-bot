import { NaticoCommand, DiscordenoMessage } from '../../deps.ts';
@createCommand
export default class help extends NaticoCommand {
	constructor() {
		super('help', {
			name: 'help',
			aliases: ['help', 'h'],
		});
	}
	exec(message: DiscordenoMessage) {
		message.util.send({
			content:
				'Hello help command comming soon for now you can use https://tricked.is-a.dev/script-bot\n\n' +
				'If your wondering what the source code of this bot is https://github.com/SkyBlockDev/script-bot',
		});
	}
}
