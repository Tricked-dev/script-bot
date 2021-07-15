import {
	bold,
	cyan,
	gray,
	red,
	yellow,
	Embed,
	NaticoCommand,
	DiscordenoMessage,
	blue,
	green,
} from '../../../deps.ts';
import { MacroClient } from '../extensions/MacroClient.ts';
enum TermColors {
	Black = '\u001b[30m',
	Red = '\u001b[31m',
	Green = '\u001b[32m',
	Yellow = '\u001b[33m',
	Blue = '\u001b[34m',
	Magenta = '\u001b[35m',
	Cyan = '\u001b[36m',
	White = '\u001b[37m',
	Reset = '\u001b[0m',
}

enum Loglevels {
	Debug,
	Info,
	Warn,
	Error,
	Wtf,
	Command,
}
export class MacroLogger {
	client: MacroClient;
	embeds: Embed[] = [];
	constructor(client: MacroClient) {
		this.client = client;
	}
	private prefixes = new Map<Loglevels, string>([
		[Loglevels.Info, cyan('[INFO]')],
		[Loglevels.Debug, gray('[DEBUG]')],
		[Loglevels.Warn, yellow('[WARN]')],
		[Loglevels.Error, red('[ERROR]')],
		[Loglevels.Wtf, bold(red('[WTF]'))],
		[Loglevels.Command, bold(blue('[COMMAND]'))],
	]);

	public info = (text: string) => {
		const error = this.getLogLocation();
		this.addEmbed(this.embed('info', text).setColor('WHITE'));
		console.log(
			`${this.currentTime()} ${this.prefixes.get(Loglevels.Info)} ${yellow(
				`[${error.filename}:${error.line}]`
			)} ${green(text)}`
		);
	};

	/**
	 * Same as log but doesnt send to the webhook
	 */
	public log = (text: string) => {
		const error = this.getLogLocation();
		console.log(
			`${this.currentTime()} ${this.prefixes.get(Loglevels.Info)} ${yellow(
				`[${error.filename}:${error.line}]`
			)} ${green(text)}`
		);
	};

	public debug = (text: string) => {
		const error = this.getLogLocation();
		this.addEmbed(this.embed('debug', text).setColor('GREEN'));
		console.debug(
			`${this.currentTime()} ${this.prefixes.get(Loglevels.Debug)} ${yellow(
				`[${error.filename}:${error.line}]`
			)} ${green(text)}`
		);
	};

	public warn = (text: string) => {
		const error = this.getLogLocation();
		this.addEmbed(this.embed('warn', text).setColor('ORANGE'));
		console.warn(
			`${this.currentTime()} ${this.prefixes.get(Loglevels.Warn)} ${yellow(
				`[${error.filename}:${error.line}]`
			)} ${green(text)}`
		);
	};

	public error = (text: string) => {
		const error = this.getLogLocation();
		this.client.error({ embeds: [this.embed('error', text).setColor('RED')] });
		console.error(
			`${this.currentTime()} ${this.prefixes.get(Loglevels.Error)} ${yellow(
				`[${error.filename}:${error.line}]`
			)} ${green(text)}`
		);
	};

	public wtf = (text: string) => {
		const error = this.getLogLocation();
		this.client.error({ embeds: [this.embed('wtf', text).setColor('RED')] });
		console.error(
			`${this.currentTime()} [${this.prefixes.get(Loglevels.Wtf)}] ${yellow(
				`[${error.filename}:${error.line}]`
			)} ${green(text)}`
		);
	};
	private addEmbed = (embed: Embed) => {
		this.embeds.push(embed);
		if (this.embeds.length == 10) {
			this.client.logs({ embeds: this.embeds });
		}
	};

	errorCommand = async (
		message: DiscordenoMessage,
		command: NaticoCommand,
		error: any
	): Promise<void> => {
		const embed = this.client.util
			.embed()
			.setAuthor(
				`${message.member!.tag} ${message.authorId}`,
				message.member!.makeAvatarURL()
			)
			.addField(`GUILD`, ` ${message.guild!.name} ${message.guild!.id}`)
			.addField(
				'LINK',
				`Message link [here](${
					message.link
				})\nError Link: ${await this.client.util.post(
					error.stack
				)}\nMessage object [here](${await this.client.util.post(
					Deno.inspect(message, {
						depth: 2,
					})
				)})`
			)
			.addField('CHANNEL', `<#${message.channel!.id}>`)
			.addField('ERROR', `\`\`\`js\n${error.stack.slice(0, 1000)}\`\`\``)
			.setDescription(
				`\`\`\`js\n${message.content.slice(0, 1000)}\`\`\`` ||
					'No message content'
			)
			.setColor('RED');
		await this.client.error({ embeds: [embed] });
		const loc = this.getLogLocation();
		console.log(
			`${this.currentTime()} ${this.prefixes.get(Loglevels.Command)} ${yellow(
				`[${loc.filename}:${loc.line}]`
			)} ${cyan(`[${command.id}]`)} ${yellow(
				cyan(`[${message.member!.tag}(${message.authorId})]`)
			)} ${red(`[ERROR]`)} ${green(error)}`
		);
	};

	command = (
		message: DiscordenoMessage,
		command: NaticoCommand,
		trigger: string
	): void => {
		if (trigger == 'Success') {
			trigger = TermColors.Green + trigger;
		} else if (trigger == 'blocked') {
			trigger = TermColors.Red + trigger;
		}
		const embed = this.client.util
			.embed()
			.addField(
				`INFO`,
				`**GUILD** ${message.guild!.name} ${message.guild!.id}\n` +
					`**CHANNEL** <#${message.channelId}> ${message.channelId}\n` +
					`**AUTHOR** ${message.tag} ${message.authorId}\n` +
					`**MESSAGE** [link](${message.link}) ${message.id}\n` +
					`**COMMAND** ${command.id}`
			)
			.setDescription(`**CONTENT:** ${message.content.slice(0, 1000)}`)
			.setColor('#1F85DE');

		this.addEmbed(embed);
		const error = this.getLogLocation();
		console.log(
			`${this.currentTime()} ${this.prefixes.get(Loglevels.Command)} ${yellow(
				`[${error.filename}:${error.line}]`
			)} ${cyan(`[${command.id}]`)} ${yellow(
				cyan(`[${message.member!.tag}(${message.authorId})]`)
			)} ${red(`[${trigger}] [${message.guild?.name} ${message.guildId}]`)}`
		);
	};

	private embed = (name: string, content: string) =>
		this.client.util.embed().setTitle(name).setDescription(content);

	private currentTime = () => {
		const now = new Date();
		return gray(
			`[${now.toLocaleDateString()} ${now
				.toLocaleTimeString()
				.toLocaleUpperCase()}]`
		);
	};
	//Snippet from https://codeberg.org/Yui/Yogger/src/branch/main/src/logger.ts#L60 - not modified
	getLogLocation = (logIndex = 0): logLocation => {
		logIndex += 2;
		const stackLines = new Error().stack!.split('\n');
		const importantLine = stackLines[logIndex + 1];

		const raw = importantLine.trim();

		if (!raw.includes(':'))
			return {
				path: raw,
				filename: '',
				line: 0,
				col: 0,
			};
		const regex = /(.+?)(?::(\d+))?(?::(\d+))?$/;
		const parts = regex.exec(raw.replace(/[()]/g, ''));

		const filePrefix = 'file:///';
		parts![1] = parts![1].replaceAll('\\', '/'); // OS Compatibility

		const startIndex = parts![1].indexOf(filePrefix);
		const path = parts![1].slice(startIndex).replace(filePrefix, '');
		const filename = path.replace(/^.*[\\\/]/, '');

		return {
			path: path,
			filename: filename,
			line: parseInt(parts![2]),
			col: parseInt(parts![3]),
		};
	};
}
export interface logLocation {
	readonly path: string;
	readonly filename: string;
	readonly line: number;
	readonly col: number;
}
