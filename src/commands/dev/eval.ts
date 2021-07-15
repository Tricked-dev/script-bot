import * as deps from '../../../deps.ts';
import { MacroCommand, Components } from '../../lib/mod.ts';
@globalThis.createCommand
export default class Eval extends MacroCommand {
	constructor() {
		super('eval', {
			name: 'eval',
			aliases: ['ev', 'eval'],
			ownerOnly: true,
			options: [
				{
					type: 3,
					name: 'code',
					description: 'code to be evaled',
					required: false,
				},
			],
		});
	}
	async exec(
		message: deps.DiscordenoMessage,
		{ code, depth }: { code: string; depth: string }
	) {
		const de = deps;
		const clientTokens = this.client.tokens;

		delete (this.client as any).tokens;
		let response;
		try {
			code = code.replace(/[“”]/g, '"').replace(/```/g, '');
			response = await eval(code);
			if (typeof response !== 'string')
				response = Deno.inspect(response, {
					depth: parseInt(depth) || 2,
				});
		} catch (e) {
			this.client.tokens = clientTokens;
			response = e;
		}

		this.client.tokens = clientTokens;

		const embed = this.client.util
			.embed()
			.setDescription(await this.client.util.codeblock(response, 4000, 'js'));

		const comps = new Components().addButton(
			`Delete`,
			'Secondary',
			`${message.authorId}-eval`
		);
		return message.util.send({ embeds: [embed], components: comps });
	}

	init() {
		this.client.interactionResponders.set('eval', async (data, member, id) => {
			if (id[0] == member.id.toString()) {
				await deps.deleteMessage(
					BigInt(data.channelId!),
					BigInt(data.message!.id)
				);
			}
		});
	}
}
