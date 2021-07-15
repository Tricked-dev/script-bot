import { MacroListener } from '../../lib/extensions/mod.ts';
import { editBotStatus, DiscordActivityTypes } from '../../../deps.ts';
@globalThis.createEvent
export default class ready extends MacroListener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
		});
	}

	exec() {
		delete this.client.config;
		this.client.logger.info('READY ' + this.client.id);
		editBotStatus({
			activities: [
				{
					name: `*help | ${
						this.client?.cache?.dispatchedGuildIds?.size +
						this.client.cache.guilds.size
					} Servers`,
					type: DiscordActivityTypes.Game,
					createdAt: Date.now(),
				},
			],
			status: 'dnd',
		});
	}
}
