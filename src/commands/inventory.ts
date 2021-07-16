import {
	NaticoCommand,
	DiscordenoMessage,
	DiscordenoMember,
} from '../../deps.ts';
@createCommand
export default class inventory extends NaticoCommand {
	constructor() {
		super('inventory', {
			name: 'inventory',
			aliases: ['inventory'],
			options: [
				{
					type: 6,
					name: 'user',
					description: 'the user you want to see the inventory of',
					required: false,
				},
			],
		});
	}
	async exec(message: DiscordenoMessage, { user }: { user: DiscordenoMember }) {
		const scripts = await this.client.query(
			'SELECT * FROM scripts WHERE owner = $1',
			[user?.id || message.authorId]
		);
		if (scripts.length == 0)
			return message.util.fail('You dont have any scripts');
		const embed = this.client.util.embed();
		for (const s of scripts) {
			const price = s.public
				? `[Price] ${s.price ? `${s.price} Tokens` : `Free`}`
				: ``;
			embed.addField(
				`​`,
				'```yml\n' +
					`[Name] :: ${s.name}\n` +
					`[Id] :: ${s.id}\n` +
					`[Public] :: ${s.public ? 'Yes' : 'No'}\n` +
					`${price}` +
					'\n```',
				false
			);
		}
		return message.util.send({ embeds: [embed] });
	}
}
