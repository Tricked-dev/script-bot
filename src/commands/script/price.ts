import { DiscordenoMessage } from '../../../deps.ts';
import { MacroSub } from '../../lib/mod.ts';

@globalThis.createCommand
export default class price extends MacroSub {
	constructor() {
		super('pricescript', {
			subOf: 'script',
			name: 'price',
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
		let content: number | null = Math.abs(
			parseInt(script.split(' ').slice(1).join(' '))
		);

		const [id] = await this.client.util.getScript(name, message.authorId);
		if (!id) return message.util.fail('Script not found');
		if (!content) {
			await this.client.query('UPDATE scripts SET price = $1 WHERE id = $2', [
				null,
				id.id,
			]);
			return message.util.send('Script is now set to be free');
		}
		if (content > 10)
			return message.util.fail('You cant set a value higher than 9');
		if (content == 0) content = null;
		await this.client.query('UPDATE scripts SET price = $1 WHERE id = $2', [
			content,
			id.id,
		]);
		return message.util.reply({
			content: 'Script price updated',
			allowedMentions: { parse: [] },
		});
	}
}
