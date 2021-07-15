import {
	sendMessage,
	createChannel,
	editChannel,
	cache,
	Permission,
} from '../../../deps.ts';
type Fun = (...args: any[]) => any | Promise<any>;

interface permissionsObject {
	[name: string]: Permission;
}

interface anyArray {
	[key: string]: any;
}

const splitCommaTrim = (str: string) =>
	str.split(',').map((x) => x.trim().replace('\\n', '\n'));

const permissions: permissionsObject = {
	say: 'SEND_MESSAGES',
	createchannel: 'MANAGE_CHANNELS',
	renamechannel: 'MANAGE_CHANNELS',
};

export class Parser {
	guild: bigint;
	channel: bigint;
	funs: Set<string> = new Set();
	vars: anyArray = {};
	converted!: string[][];
	constructor(
		input: string | undefined,
		code: string,
		guild: bigint,
		channel: bigint
	) {
		this.guild = guild;
		this.channel = channel;
		this.vars['input'] = input;
		this.convert(code);
	}

	convert = (x: string) => {
		const split = x.split('\n');
		const data = split.map((x) => {
			let varname;
			let fun;
			const split = x.split(' ');
			if (x.startsWith('$')) {
				varname = split[0].replace('$', '');

				fun = split.slice(1).shift();
			} else {
				fun = split.shift();
			}
			if (fun) this.funs.add(fun);
			const data = split.join(' ');

			return [fun as string, data as string, varname as string];
		});
		this.converted = data;
		return data;
	};

	functions = new Map<string, Fun>([
		[
			'say',
			async (x: string) => {
				const message = await sendMessage(this.channel, {
					content: x,
					allowedMentions: {
						parse: [],
					},
				});
				return message.id;
			},
		],
		[
			'createchannel',
			async (name: string) => {
				const channel = await createChannel(
					this.guild,
					{
						name: name,
					},
					'This was executed by a script'
				);
				return channel.id.toString();
			},
		],
		[
			'renamechannel',
			async (x, y) => {
				const channel = cache.channels.find((a) => a.id.toString() == x);
				if (!channel) return false;
				await editChannel(
					channel.id,
					{
						name: y,
					},
					'This was executed by a script'
				);
				return x;
			},
		],
		['str', (x) => x],
		['face', (x, u) => `${x} :-) ${u}`],
	]);
	handleVars = (data: string) => {
		const returndata = data.split(' ');
		if (data.includes('$')) {
			for (const row in returndata) {
				let data = returndata[row];
				if (data.startsWith('$')) {
					data = data.replace('$', '');

					returndata[row] = this.vars[data.trim()];
				}
			}
		}

		return returndata.join(' ');
	};

	calculatePermissions = (): Permission[] => {
		const perms = [];

		for (const fun of this.funs) {
			perms.push(permissions[fun]);
		}

		return perms as Permission[];
	};

	parse = async () => {
		for (let [fn, data, varname] of this.converted) {
			if (!fn) continue;

			const newData = this.handleVars(data);

			data = newData;

			const fun = this.functions.get(fn as string);

			if (!fun) return 'The function provided doesnt exist';

			const args = splitCommaTrim(data.replace(fn, '').trim());

			if (fun.length > args.length) {
				return `The function ${fn} requires ${fun.length} arguments and you provided ${args.length}`;
			}

			const result = await fun(...args);

			if (result && varname) this.vars[varname] = result;
		}
	};
}
