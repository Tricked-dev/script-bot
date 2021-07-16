import { DiscordenoMessage, hasChannelPermissions } from '../../../deps.ts';
import { MacroSub, generate, Components } from '../../lib/mod.ts';
import { Parser } from '../../lib/functions/bashbot.ts';

@globalThis.createCommand
export default class description extends MacroSub {
	constructor() {
		super('scriptdescription', {
			subOf: 'script',
			name: 'description',
			clientPermissions: ['SEND_MESSAGES'],
			options: [
				{
					type: 3,
					name: 'script',
					description: `The code for the script`,
					required: true,

					choices: [],
				},
			],
		});
	}
	async exec(message: DiscordenoMessage, { script }: { script: string }) {
		if (!script) return message.util.fail('No script provided');
		const name = script.split(' ')[0];
		const content = script.split(' ').slice(1).join(' ');
		const [id] = await this.client.util.getScript(name, message.authorId);
		if (!id) return message.util.fail('Script not found');
		await this.client.query(
			'UPDATE scripts SET description = $1 WHERE id = $2',
			[content, id.id]
		);
		return message.util.send({ content: `Script ${id.name} has been updated` });
	}
}
