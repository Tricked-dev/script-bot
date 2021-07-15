import {
	DiscordInteractionTypes,
	Interaction,
	DiscordenoMember,
	deleteMessage,
	sendInteractionResponse,
	DiscordInteractionResponseTypes,
} from '../../../deps.ts';
import { MacroListener } from '../../lib/mod.ts';
@globalThis.createEvent
export default class interactionCreate extends MacroListener {
	constructor() {
		super('interactionCreate', {
			emitter: 'client',
			event: 'interactionCreate',
		});
	}

	async exec(data: Interaction, member: DiscordenoMember) {
		if (data.type === DiscordInteractionTypes.MessageComponent) {
			if (data.data!.customId == 'preview')
				return sendInteractionResponse(data.id, data.token, {
					type: DiscordInteractionResponseTypes.DeferredUpdateMessage,
				});
			if (!data.data!.customId.includes('-')) return;
			const key = data.data!.customId.split('-').reverse();
			const command = this.client.interactionResponders.get(key[0]);
			if (command)
				return await command(data, member, data.data!.customId.split('-'));

			if (data.data!.customId.endsWith('ar')) {
				this.client.logger.debug(`[AR DELETED] ${member.tag} ${member.id}`);
				deleteMessage(BigInt(data.channelId!), BigInt(data.message!.id));
			}
		}
	}
}
