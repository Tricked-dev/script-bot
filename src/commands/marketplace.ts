import { NaticoCommand, DiscordenoMessage } from '../../deps.ts';
@createCommand
export default class marketplace extends NaticoCommand {
	constructor() {
		super('marketplace', {
			name: 'marketplace',
			aliases: ['marketplace'],
			// options: [
			// 	{
			// 		type: 1,
			// 		name: 'top',
			// 		description: 'view the most voted things on the marketplace',
			// 		options: [],
			// 	},
			// 	{
			// 		type: 1,
			// 		name: 'search',
			// 		description: 'search for something on the marketplace',
			// 		options: [
			// 			{
			// 				type: 3,
			// 				name: 'script',
			// 				description: 'the script you want to search for',
			// 				required: true,
			// 			},
			// 		],
			// 	},
			// 	{
			// 		type: 1,
			// 		name: 'uses',
			// 		description: 'view the most used scripts',
			// 		options: [],
			// 	},
			// ],
		});
	}
	async exec(message: DiscordenoMessage) {
		const rows = await this.client.query(
			`SELECT price, name, id FROM scripts WHERE public = true ORDER BY RANDOM() LIMIT 25;`
		);
		const embed = await this.client.util.embed();
		for (const row of rows) {
			embed.addField(
				`​`,
				'```yml\n' +
					`[Name] :: ${row.name}\n` +
					`[Id] :: ${row.id}\n` +
					`[Price] :: ${row.price ? `${row.price} Tokens` : `Free`}` +
					'\n```',
				false
			);
		}
		return message.util.reply({ embeds: [embed] });
	}
}
