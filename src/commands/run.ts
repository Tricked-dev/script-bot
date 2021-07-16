import { Parser } from '../lib/functions/bashbot.ts';
import {
	NaticoCommand,
	DiscordenoMessage,
	hasChannelPermissions,
} from '../../deps.ts';
@createCommand
export default class run extends NaticoCommand {
	constructor() {
		super('run', {
			name: 'run',
			aliases: ['run'],
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

		const perms = parser.calculatePermissions();

		if (
			!(await hasChannelPermissions(message.channelId, message.authorId, perms))
		) {
			return message.util.fail(
				`You dont have enough permissions in this server to run this\n\nSay requires manage messages`
			);
		}
		if (
			!(await hasChannelPermissions(message.channelId, this.client.id, perms))
		) {
			return message.util.fail(
				`i dont have enough permissions in this server to run this\n\nSay requires manage messages`
			);
		}

		const res = await parser.parse();
		if (res) return await message.util.send({ content: res });
		else
			return await message.util.send({
				content: 'Command didnt return anything',
			});
	}
}
