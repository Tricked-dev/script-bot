import { Parser } from '../lib/functions/bashbot.ts';
import { NaticoCommand, DiscordenoMessage } from '../../deps.ts';
@createCommand
export default class script extends NaticoCommand {
	constructor() {
		super('script', {
			name: 'script',
			aliases: ['script'],
			ownerOnly: true,
			options: [
				{
					type: 1,
					name: 'run',
					description: 'run a script you have in your inventory',
					options: [
						{
							type: 3,
							name: 'script',
							description:
								'the id or name of the script everything after the first space will be taken as input',
							required: true,
						},
					],
				},
				{
					type: 1,
					name: 'create',
					description: 'create a script',
					options: [
						{
							type: 3,
							name: 'script',
							description: 'the code of the script',
							required: true,
						},
					],
				},

				{
					type: 1,
					name: 'description',
					description:
						'the id or name of the script everything after the first space will be taken as description',
					options: [
						{
							type: 3,
							name: 'id',
							description:
								'the id or name of the script everything after the first space will be taken as input',
							required: false,
						},
					],
				},
				{
					type: 1,
					name: 'name',
					description: 'set the name of a script',
					options: [
						{
							type: 3,
							name: 'id',
							description:
								'the id or name of the script everything after the first space will be taken as the new name',
							required: false,
						},
					],
				},
				{
					type: 1,
					name: 'view',
					description: 'view information about a script',
					options: [
						{
							type: 3,
							name: 'id',
							description:
								'the id or name of the script everything after the first space will be taken as the new name',
							required: false,
						},
					],
				},
			],
		});
	}
	async exec(message: DiscordenoMessage, { args }: { args: string }) {
		//TODO ADD THINGS
		return await message.util.reply('Place holder');
	}
}
