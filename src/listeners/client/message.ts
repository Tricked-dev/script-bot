import { DiscordenoMessage, addReaction } from '../../../deps.ts';
import { MacroListener } from '../../lib/mod.ts';

@globalThis.createEvent
export default class messageCreate extends MacroListener {
	constructor() {
		super('messageCreate', {
			emitter: 'client',
			event: 'messageCreate',
		});
	}

	async exec(message: DiscordenoMessage) {
		if (message.channelId == 818158216156413973n) {
			return await this.client.util.update(
				addReaction(
					message.channelId,
					message.id,
					'<a:updating:824662408239906897>'
				)
			);
		}

		if (!message?.guild?.id) {
			if (this.client.id == message.authorId) return;
			this.client.logger.debug(`[DM] ${message.tag}`);

			const embed = this.client.util;
		}
	}
}
