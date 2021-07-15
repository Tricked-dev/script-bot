import { DiscordenoMessage, hasChannelPermissions } from '../../../deps.ts';
import { MacroSub } from '../../lib/mod.ts';
import { Parser } from '../../lib/functions/bashbot.ts';

@globalThis.createCommand
export default class scriptrun extends MacroSub {
	constructor() {
		super('scriptrun', {
			subOf: 'script',
			name: 'run',
			clientPermissions: ['SEND_MESSAGES'],
			options: [
				{
					type: 3,
					name: 'script',
					description:
						'the id or name of the script everything after the first space will be taken as input',
					required: false,
				},
			],
		});
	}
	async exec(message: DiscordenoMessage, { script }: { script: string }) {
		if (!script) return message.util.fail('No script provided');
		const name = script.split(' ')[0];
		const input = script.split(' ').slice(1).join(' ');
		const [code] = (await this.client.util.getScript(
			name,
			message.authorId
		)) as any;
		if (!code) return message.util.fail(`Script ${name} not found.`);
		const parser = new Parser(
			input,
			code.code,
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
		if (res)
			return message.util.send({
				content: `Script ended with message: **${res}**`,
			});
		else return message.util.send({ content: 'Script ended with no message' });
	}
}
