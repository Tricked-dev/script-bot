import {
	NaticoCommandUtil,
	Embed,
	DiscordenoMessage,
	sendMessage,
	CreateMessage,
	NaticoCommandHandler,
} from '../../../../deps.ts';
import { MacroCommandHandler } from '../mod.ts';
import { MessageCollector } from '../../classes/collector.ts';
export class MacroCommandUtil extends NaticoCommandUtil {
	constructor(handler: MacroCommandHandler, message: DiscordenoMessage) {
		super(handler as unknown as NaticoCommandHandler, message);
	}
	paginate(pages: Embed[], defaultPage?: number, buttonTimeout?: number) {
		return this.handler.client.util.CreateEmbedsButtonsPagination(
			this.message.id,
			this.message.channel!.id,
			this.message.authorId,
			pages,
			defaultPage,
			buttonTimeout
		);
	}
	async needMessage(
		filter: (message: DiscordenoMessage) => boolean | Promise<boolean> = (
			msg: DiscordenoMessage
		) => this.message.authorId !== msg.authorId,
		duration = 60000,
		message?: CreateMessage
	) {
		if (message) await sendMessage(this.message.id, message);
		return new Promise<boolean>((resolve, reject) => {
			//@ts-ignore -
			const collector = new MessageCollector(
				this.message,
				this.handler.client,
				{ filter, duration }
			);
			collector.once('end', (msgs) =>
				msgs && msgs[0] ? resolve(msgs[0]) : reject()
			);
		});
	}

	async fail(content: string | CreateMessage): Promise<DiscordenoMessage> {
		const embed: Embed = {
			title: '<:x_:862991784824537098> Error',
			color: 15675215,
			timestamp: new Date(Date.now()).toISOString(),
			footer: {
				text: 'use help <command> for help about the command',
				iconUrl:
					'https://cdn.discordapp.com/avatars/749020331187896410/ee3118fefda39bc31ab7dcbc6df794ad.png?size=2048',
			},
		};
		if (typeof content !== 'string') {
			embed.description = content.content;
		} else {
			embed.description = content;
		}
		if (this.parsed.isSlash) {
			content = {
				//@ts-ignore -
				type: 4,
				data: {
					embed: [embed],
				},
			};
			const sent = await this.message.send(content);
			return sent as DiscordenoMessage;
		}
		const sent = await this.message.send({ embeds: [embed] });
		return sent as DiscordenoMessage;
	}
}
