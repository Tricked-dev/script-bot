import { MacroClient } from '../MacroClient.ts';
import {
	sendMessage,
	NaticoClientUtil,
	NaticoEmbed as Embed,
	ApplicationCommandOption,
	filemap,
	ENGLISH,
	getMessage,
} from '../../../../deps.ts';
import { MacroCommand } from './MacroCommand.ts';
interface guilds extends Record<string, unknown> {
	id: bigint;
	prefix: string[];
	language: string;
	githubchannel: bigint;
	repos: string[];
	vip: boolean;
	supportchannel: bigint;
	supportmessage: string;
	supporttitle: string;
	modlogs: bigint;
	suggestionchannel: bigint;
	deniedchannel: bigint;
	publish: bigint[];
	acceptedchannel: bigint;
	emojis: bigint[];
}
const decoder = new TextDecoder();
const encoder = new TextEncoder();

interface hastebinRes {
	key: string;
}
interface Fetch extends RequestInit {
	params?: { [name: string]: string };
}
enum languages {
	en = 1,
	owo = 2,
}
const ln = {
	[languages.en]: ENGLISH,
	[languages.owo]: ENGLISH,
};
export interface fn {
	(...args: string[]): string;
}
interface Support {
	channel: bigint;
	title: string;
	content: string;
	sugchannel?: bigint;
}
export class MacroUtil extends NaticoClientUtil {
	declare client: MacroClient;
	dataDir = `${Deno.cwd()}/data.json`;
	cache: any;
	constructor(client: MacroClient) {
		super(client);
		this.client = client;
	}
	updateTranslations() {
		const list = [];
		for (const [name, command] of this.client.commandHandler.modules) {
			list.push(
				`"${name.toUpperCase()}_DESCRIPTION_USAGE": "${
					//@ts-ignore-

					ENGLISH[`${name.toUpperCase()}_DESCRIPTION_USAGE`] || ''
				}",`.replaceAll('\n', '\\n')
			);

			list.push(
				`"${name.toUpperCase()}_DESCRIPTION_DESCRIPTION": "${
					//@ts-ignore-
					ENGLISH[`${name.toUpperCase()}_DESCRIPTION_DESCRIPTION`] ||
					command.description ||
					''
				}",`.replaceAll('\n', '\\n')
			);

			list.push(
				`"${name.toUpperCase()}_DESCRIPTION_EXAMPLES": "${
					//@ts-ignore-
					ENGLISH[`${name.toUpperCase()}_DESCRIPTION_EXAMPLES`] ||
					command.examples ||
					''
				}",`.replaceAll('\n', '\\n')
			);
		}
		console.log(list.join('\n'));
	}

	tr(language: languages, thing: string, ...args: string[]): string {
		let translation: string | fn;
		//@ts-ignore -

		translation = ln[language][thing];
		if (!translation) {
			this.client.logger.info(thing);
			return '';
		}
		if (typeof translation == 'function') {
			translation = translation(...args);
		}
		return translation;
	}

	async saveAttachment(link: string) {
		const data = await fetch(link);
		const blob = await data.blob();
		const msg = await sendMessage(815328569051971595n, {
			file: [
				{
					blob: blob,
					name: `macro.${blob.type.endsWith('png') ? 'png' : 'jpg'}`,
				},
			],
		});
		return msg.attachments[0].url;
	}

	getObject(message: any, things: any): { [translated: string]: string } {
		const language = languages.en;

		const returnData: { [key: string]: string } = {};

		for (const key in things) {
			const translation = this.tr(language, key, ...things[key]);
			returnData[key] = translation;
		}

		return returnData;
	}

	async post(contents: string) {
		const res: hastebinRes = await (
			await fetch('https://hst.sh' + '/' + 'documents', {
				method: 'POST',
				body: contents,
			})
		).json();

		return `${'https://hst.sh'}/${res.key}`;
	}

	async fetch(query: string, data?: Fetch) {
		const url = new URL(query);
		if (data && data.params) {
			Object.keys(data.params).forEach((key) =>
				url.searchParams.append(key, data!.params![key])
			);
			delete data.params;
		}
		return (await fetch(url, data)).json();
	}

	hst = (body: string): Promise<string> | string => this.post(body);
	embed = () => new Embed().setColor('#0d9932');
	getMsg = async (id: bigint, channelId: bigint) =>
		this.client.cache.messages.get(id) ||
		(await getMessage(channelId, id).catch(() => undefined));
	random = (low: number, high: number = low) =>
		Math.floor(Math.random() * high) + (high - low);

	async getFile(defaults?: any) {
		if (!(await this.exists(this.dataDir))) {
			await this.set({});
		}
		if (this.cache) {
			if (defaults) this.cache = this.defaults(defaults, this.cache);
			this.cache;
		}
		const data = await Deno.readFile(this.dataDir);
		this.cache = JSON.parse(decoder.decode(data));
		if (defaults) this.cache = this.defaults(defaults, this.cache);
		return this.cache;
	}

	defaults(defaults: any, replace: any) {
		return { ...defaults, ...replace };
	}
	set(data: any) {
		this.cache = this.deepMerge(this.cache, data);

		const encoded = encoder.encode(JSON.stringify(data));
		return Deno.writeFile(this.dataDir, encoded);
	}
	async exists(filePath: string): Promise<boolean> {
		try {
			await Deno.lstat(filePath);
			return true;
		} catch (err) {
			if (err instanceof Deno.errors.NotFound) {
				return false;
			}

			throw err;
		}
	}
	sleep(ms: number): Promise<string> {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	async init() {}

	// deno-lint-ignore no-explicit-any
	isObject(item: any) {
		return item && typeof item === 'object' && !Array.isArray(item);
	}
	deepMerge(
		// deno-lint-ignore no-explicit-any
		baseObject: any,
		// deno-lint-ignore no-explicit-any
		...mergeObjects: any
	): // deno-lint-ignore no-explicit-any
	Record<string, any> {
		if (!mergeObjects.length) return baseObject;
		const source = mergeObjects.shift();

		if (this.isObject(baseObject) && this.isObject(source)) {
			for (const key in source) {
				if (this.isObject(source[key])) {
					if (!baseObject[key]) Object.assign(baseObject, { [key]: {} });
					this.deepMerge(baseObject[key], source[key]);
				} else {
					Object.assign(baseObject, { [key]: source[key] });
				}
			}
		}

		return this.deepMerge(baseObject, ...mergeObjects);
	}
	async codeblock(
		code: string,
		length: number,
		language: 'ts' | 'js' | 'sh' | 'json' | 'md' | 'sql' | '' = ''
	): Promise<string> {
		let hasteOut = '';
		const tildes = '```';
		const formattingLength =
			2 * tildes.length + language.length + 2 * '\n'.length;
		if (code.length + formattingLength > length)
			hasteOut = 'haste: ' + (await this.hst(code));

		const code2 =
			code.length > length
				? code.substring(
						0,
						length - (hasteOut.length + '\n'.length + formattingLength)
				  )
				: code;
		return (
			tildes +
			language +
			'\n' +
			code2.replace(/```/g, '`\u200b``') +
			'\n' +
			tildes +
			(hasteOut.length ? '\n' + hasteOut : '')
		);
	}

	getScript = async (name: string, user: bigint) => {
		//WHERE id = $1 AND owner = $2 OR

		const res = await this.client.query(
			`SELECT * FROM scripts WHERE name = $1 AND owner = $2 LIMIT 1`,
			[name, user]
		);
		// .catch(() => []);
		if (res.length !== 0) return res;
		const num = parseInt(name);
		if (!num) return [];
		return await this.client.query(
			`SELECT * FROM scripts WHERE id = $1 AND owner = $2 LIMIT 1`,
			[num, user]
		);
		// .catch(() => []);
	};
	getHelpEmbed(command: MacroCommand) {
		const [description, usage, examples] = [
			this.tr(
				languages.en,
				`${command.id.toUpperCase()}_DESCRIPTION_DESCRIPTION`
			),
			this.tr(languages.en, `${command.id.toUpperCase()}_DESCRIPTION_USAGE`),
			this.tr(languages.en, `${command.id.toUpperCase()}_DESCRIPTION_EXAMPLE`),
		];

		const embed = this.client.util
			.embed()
			.addField('Description »', description || 'No description')
			.addField('category »', command.category || 'No category');

		if (command.aliases)
			embed.addField(
				'aliases »',
				command.aliases.map((x) => `\`${x}\``).join(' | ')
			);

		if (usage) embed.addField('Usage »', `${command.id} ${usage}`);

		if (examples) embed.addField('Examples »', `${command.id} ${examples}`);
		//@ts-ignore -
		if (filemap[command.id.toUpperCase()])
			embed.setImage(filemap[command.id.toUpperCase()]);

		if (command.options) {
			embed.addField(
				'args »',
				(command.options as ApplicationCommandOption[])
					.map((x) => {
						if (x.name && x.description) {
							return `**${x.name}**: ${x.description}`;
						} else return null;
					})
					.join('\n')
			);
		}

		return embed;
	}

	async exec(code: string) {
		try {
			return new TextDecoder().decode(
				await Deno.run({
					cmd: code.split(' '),
					stdout: 'piped',
					stderr: 'piped',
				}).output()
			);
		} catch (e) {
			return `${e}`;
		}
	}
	async updateDocs() {
		const files = new Map();
		for (const [name, category] of this.client.commandHandler.categories) {
			if (name == 'dev') continue;
			files.set(
				name,
				category.map((cmd) => {
					const command = {
						name: cmd.id,
						description: this.client.util.tr(
							1,
							`${cmd.id.toUpperCase()}_DESCRIPTION_DESCRIPTION`
						),
					};

					//@ts-ignore -
					if (filemap[cmd.id.toUpperCase()])
						command.image = filemap[cmd.id.toUpperCase()];

					return command;
				})
			);
		}
		const encoder = new TextEncoder();
		for (const [fileName, input] of files) {
			await Deno.writeFile(
				`${Deno.cwd()}/macrobot.github.io/docs/commands/${fileName}.json`,
				encoder.encode(JSON.stringify(input))
			);
		}
	}
	async update(react: Promise<undefined>) {
		//Already up to date.
		if (this.client.suggestiononly) {
			await this.exec('git pull');
			return Deno.exit(69);
		}
		const res = await this.exec('git pull');
		if (res.includes('lready up to date')) return false;
		await this.exec('sh update.sh');
		await this.updateDocs();
		await this.exec('sh finish.sh');
		this.client.logger.debug(`[UPDATING]`);
		await react;
		Deno.exit(68);
	}
	limit(val: number, min: number, max: number) {
		return val < min ? min : val > max ? max : val;
	}
}
