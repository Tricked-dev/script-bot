import { DiscordenoMessage, sendInteractionResponse } from '../../../deps.ts';
import { MacroSub, generate, Components } from '../../lib/mod.ts';
@globalThis.createCommand
export default class create extends MacroSub {
	constructor() {
		super('scriptcreate', {
			subOf: 'script',
			name: 'create',
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
		if (!script) return message.util.fail('No description provided');
		const id = generate();
		const name = Math.random().toString(36).replace('0.', '').slice(0, 3);
		Math.random().toString(36).replace('0.', '');
		await this.client.query(
			'INSERT INTO scripts(created, id, uses, owner, name, code, public) VALUES($1, $2, $3, $4, $5, $6, $7)',
			[Date.now(), id, 0, message.authorId, name, script, false]
		);

		const embed = this.client.util
			.embed()
			.setColor('9e6235')
			.setDescription(
				'```yml\n' +
					`[Name] :: ${name}\n` +
					`[Id] :: ${id}\n` +
					`[Description] :: Not set\n` +
					`[Lines] :: ${script.split('\n').length}` +
					'```'
			)
			.setTitle('SCRIPT CREATED');
		const comps = new Components()
			.addButton(
				'Rename',
				'Secondary',
				`rename-${id}-${message.authorId}-script`
			)
			.addButton(
				'Set the description',
				'Secondary',
				`description-${id}-${message.authorId}-script`
			)
			.addButton(
				'Delete',
				'Secondary',
				`delete-${id}-${message.authorId}-script`
			);
		return message.util.send({ embeds: [embed], components: comps });
	}
	init() {
		this.client.interactionResponders.set('script', async (i, m, d) => {
			if (d[0] == 'rename') {
				return sendInteractionResponse(i.id, i.token, {
					private: true,
					type: 4,
					data: {
						content: 'To rename a script use `script rename <id> <newname>`',
					},
				});
			}
			if (d[0] == 'description') {
				return sendInteractionResponse(i.id, i.token, {
					private: true,
					type: 4,
					data: {
						content:
							'to set the description of a use `script description <id> <newname>`',
					},
				});
			}
			if (d[0] == 'delete') {
				const comps = new Components().addButton(
					'confirm',
					'Danger',
					`confirm-${d[1]}-script`
				);
				return sendInteractionResponse(i.id, i.token, {
					private: true,
					type: 4,
					data: {
						content: 'Are you sure you want to delete this script?',
						components: comps,
					},
				});
			}
			if (d[0] == 'confirm') {
				await this.client.query(`DELETE FROM scripts WHERE id = $1`, [d[1]]);
				return sendInteractionResponse(i.id, i.token, {
					private: true,
					type: 4,
					data: {
						content: 'Deleted the script',
					},
				});
			}
		});
	}
}
