import { NaticoCommand, DiscordenoMessage, Embed } from '../../deps.ts';
@createCommand
export default class marketplace extends NaticoCommand {
	constructor() {
		super('marketplace', {
			name: 'marketplace',
			aliases: ['marketplace', 'shop'],
		});
	}
	async exec(message: DiscordenoMessage) {
		const scripts = await this.client.query(
			'Select price, name, id from scripts WHERE public = true ORDER BY RANDOM () LIMIT 25'
		);

		const embed = this.client.util.embed().setTitle('Script marketplace');
		let cur = 0;
		for (const s of scripts) {
			if (cur == 0 || cur == 1) {
				embed.addField(
					`​\u200B`,
					'```yml\n' +
						`[Name] :: ${s.name}\n` +
						`[Id] :: ${s.id}\n` +
						`[Price] :: ${s.price ? `${s.price} Tokens` : `Free`}` +
						'\n```',
					true
				);
			} else {
				embed.addBlankField();
			}
			cur++;
			if (cur == 3) cur = 0;
		}
		return message.util.send({ embeds: [embed] });
	}
}
