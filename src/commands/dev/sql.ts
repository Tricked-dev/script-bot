import { DiscordenoMessage } from '../../../deps.ts';
import { Table } from '../../../deps.ts';
import { MacroCommand } from '../../lib/extensions/mod.ts';
@globalThis.createCommand
export default class sql extends MacroCommand {
	constructor() {
		super('sql', {
			name: 'sql',
			aliases: ['sql', 'postgres'],
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
	async exec(message: DiscordenoMessage, { code }: { code: string }) {
		let msg: string;
		try {
			const output: any = await this.client.query(code);
			if (output.length == 0) msg = 'Nothing was returned';
			else {
				const table = new Table({ header: Object.keys(output[0]) });
				msg = table.fromObjects(output).toString();
			}
		} catch (e) {
			msg = e.stack;
		}
		message.util.send({
			content: await this.client.util.codeblock(
				msg.replace(/|\[1m|\[22m|\[|\[/gim, ''),
				2000,
				'sql'
			),
		});
	}
}
