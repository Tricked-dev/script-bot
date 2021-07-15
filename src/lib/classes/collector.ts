import { EventEmitter, DiscordenoMessage } from '../../../deps.ts';
import { MacroClient } from '../extensions/MacroClient.ts';
export class MessageCollector extends EventEmitter {
	#client: MacroClient;
	#message: DiscordenoMessage;
	messages: DiscordenoMessage[] = [];
	duration: number;
	filter?: fn;
	timeout!: number;
	amount: number;
	ended = false;
	constructor(
		message: DiscordenoMessage,
		client: MacroClient,
		{ filter, amount = 1, duration = 60000 }: CollectorOptions
	) {
		super();
		this.#message = message;
		this.#client = client;
		this.amount = amount;
		this.filter = filter;
		this.duration = duration;
		const handleMessage = (message: DiscordenoMessage) =>
			this.handleMessage(message);

		this.#client.on('messageCreate', handleMessage);

		this.timeout = setTimeout(() => {
			this.emit('end', undefined);
			this.removeAllListeners();
			return this.#client.removeListener('messageCreate', handleMessage);
		}, duration);
	}
	get recieved() {
		return this.messages.length;
	}
	async handleMessage(message: DiscordenoMessage) {
		if (this.#message.channelId !== message.channelId) return;
		if (this.filter && (await this.filter(message))) return;

		this.messages.push(message);

		this.emit('collect', message);

		this.amount = this.amount - 1;

		if (this.amount == 0) {
			this.ended = true;
			this.emit('end', this.messages);
			this.removeAllListeners();
			clearTimeout(this.timeout);
		}
	}
}
export interface CollectorOptions {
	duration?: number;
	filter?: fn;
	amount?: number;
}
type fn = (message: DiscordenoMessage) => Promise<boolean> | boolean;
