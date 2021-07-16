import {
	DiscordenoMessage,
	DiscordInteractionResponseTypes,
	sendInteractionResponse,
} from '../../../deps.ts';
import { MacroSub, Components } from '../../lib/mod.ts';
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

					choices: [],
				},
			],
		});
	}
	async exec(message: DiscordenoMessage, { script }: { script: string }) {
		if (!script) return message.util.fail('No script provided');
		const name = script.split(' ')[0];
		const [id] =
			(await this.client.query(
				`SELECT * FROM scripts where name = $1 LIMIT 1`,
				[name]
			)) ??
			(await this.client.query(`SELECT * FROM scripts where id = $1 LIMIT 1`, [
				parseInt(name) || 0,
			]));

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
					`[Description] :: ${id.description || 0}\n` +
					`[Price] :: ${id.price ? `${id.price} Tokens` : 'Free'}\n` +
					`[Lines] :: ${(id.code as string).split('\n').length}` +
					'\n```'
			);
		if ((id.public && !id.price) || id.owner == message.authorId)
			embed.addField('[Code]', '```sh\n' + id.code + '\n```');
		const comps = new Components();
		if (!id?.public)
			comps.addButton(
				'Make public',
				'Primary',
				`public-${id.id}-${message.authorId}-view`
			);

		return message.util.reply({
			embeds: [embed],
			components: comps,
			allowedMentions: { parse: [] },
		});
	}
	init() {
		this.client.interactionResponders.set('view', async (i, m, b) => {
			if (BigInt(b[2]) !== m.id) {
				return sendInteractionResponse(i.id, i.token, {
					type: DiscordInteractionResponseTypes.DeferredUpdateMessage,
				});
			}
			if (b[0] == 'public') {
				await this.client.query(
					'UPDATE scripts SET public = true WHERE id = $1',
					[b[1]]
				);
				return sendInteractionResponse(i.id, i.token, {
					type: 4,
					private: true,
					data: {
						content: 'Succesfully set the script public',
					},
				});
			}
		});
	}
}
