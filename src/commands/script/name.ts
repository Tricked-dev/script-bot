import { DiscordenoMessage } from '../../../deps.ts';
import { MacroSub } from '../../lib/mod.ts';

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
		const content = script.split(' ').slice(1).join(' ').slice(0, 20);
		if (!content) return message.util.fail('No new name provided');
		const [id] = await this.client.util.getScript(name, message.authorId);
		if (!id) return message.util.fail('Script not found');
		await this.client.query('UPDATE scripts SET name = $1 WHERE id = $2', [
			content,
			id.id,
		]);
		return message.util.send({ content: `Script ${id.name} has been updated` });
	}
}
