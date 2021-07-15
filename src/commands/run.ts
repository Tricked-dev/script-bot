import { Parser } from '../lib/functions/bashbot.ts';
import { NaticoCommand, DiscordenoMessage } from '../../deps.ts';
@createCommand
export default class run extends NaticoCommand {
	constructor() {
		super('run', {
			name: 'run',
			aliases: ['run'],
			userPermissions: ['ADMINISTRATOR'],
			ownerOnly: true,
			options: [
				{
					type: 3,
					name: 'args',
					description: 'the arguments you want for the command',
					required: true,
				},
			],
		});
	}
	async exec(message: DiscordenoMessage, { args }: { args: string }) {
		const parser = new Parser(
			undefined,
			args,
			message.guildId,
			message.channelId
		);

		const res = await parser.parse();
		if (res) return await message.util.send({ content: res });
		else
			return await message.util.send({
				content: 'Command didnt return anything',
			});
	}
}
