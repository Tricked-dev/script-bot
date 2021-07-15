import { DiscordenoMessage, hasChannelPermissions } from '../../../deps.ts';
import { MacroSub, generate, Components } from '../../lib/mod.ts';
import { ms } from '../../lib/mod.ts';

@globalThis.createCommand
export default class view extends MacroSub {
	constructor() {
		super('scriptview', {
			subOf: 'script',
			name: 'view',
			clientPermissions: ['SEND_MESSAGES'],
			options: [
				{
					type: 3,
					name: 'script',
					description: `The code for the script`,
					required: true,
					prompt:
						'Please provide a script\n\nThis action will expire in 10 seconds',
					choices: [],
				},
			],
		});
	}
	async exec(message: DiscordenoMessage, { script }: { script: string }) {
		if (!script) return message.util.fail('No script provided');
		const name = script.split(' ')[0];
		const [id] = await this.client.util.getScript(name, message.authorId);
		if (!id) return message.util.fail('Script not found');
		const created = ms(Date.now() - Number(id.created), {
			long: true,
		});
		const embed = this.client.util
			.embed()
			.setDescription(
				'```yml\n' +
					`[Created] :: ${created} Ago\n` +
					`[Id] :: ${id.id}\n` +
					`[Uses] :: ${id.uses || 0}\n` +
					`[Owner] :: ${id.owner}\n` +
					`[Public] :: ${id.public}\n` +
					`[Votes] :: ${id.votes || 0}\n` +
					`[Price] :: ${id.price ? `${id.price} Tokens` : 'Free'}` +
					'\n```'
			);
		if ((id.public && !id.price) || id.owner == message.authorId)
			embed.addField('[Code]', '```sh\n' + id.code + '\n```');
		return message.util.reply({
			embeds: [embed],
			allowedMentions: { parse: [] },
		});
	}
}
