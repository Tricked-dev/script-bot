import {
	ApplicationCommandOption,
	Collection,
	DiscordApplicationCommandOptionTypes,
	DiscordenoMessage,
	EditGlobalApplicationCommand,
	upsertSlashCommands,
	botId,
	getMissingChannelPermissions,
	DiscordInteractionTypes,
	SlashCommandInteraction,
	CommandHandlerEvents,
	ArgumentGenerator,
	NaticoInhibitorHandler,
	NaticoHandler,
	createNaticoInteraction,
	prefixFn,
	ConvertedOptions,
	NaticoCommand,
} from '../../../deps.ts';
import { MacroCommand, MacroSub, MacroClient } from '../extensions/mod.ts';
import { MacroCommandUtil } from '../extensions/natico/MacroCommandUtil.ts';
export interface NaticoCommandHandlerOptions {
	directory?: string;
	prefix?: prefixFn | string | string[];
	ignoreCD?: bigint[];
	owners?: bigint[];
	cooldown?: number;
	rateLimit?: number;
	superusers?: bigint[];
	guildonly?: boolean;
	handleEdits?: boolean;
	subType?: 'single';
	commandUtil?: boolean;
	storeMessages?: boolean;
	mentionPrefix?: boolean;
	handleSlashCommands?: boolean;
}
export class MacroCommandHandler extends NaticoHandler {
	declare modules: Collection<string, MacroCommand | MacroSub>;
	declare commandUtils: Collection<BigInt, MacroCommandUtil>;
	cooldowns: Collection<any, any>;
	ignoreCD: bigint[];
	owners: bigint[];
	cooldown: number;
	superusers: bigint[];
	guildonly: boolean;
	prefix: prefixFn | string | string[];
	handleEdits: boolean;
	inhibitorHandler!: NaticoInhibitorHandler;
	generator: ArgumentGenerator;
	commandUtil: boolean;
	storeMessages: boolean;
	mentionPrefix: boolean;
	handleSlashCommands: boolean;
	subType: 'single';
	constructor(
		client: MacroClient,
		{
			directory = './commands',
			prefix = '!',
			ignoreCD = [],
			owners = [],
			cooldown = 5000,
			superusers = [],
			guildonly = false,
			handleEdits = false,
			subType = 'single',
			commandUtil = true,
			storeMessages = true,
			mentionPrefix = true,
			handleSlashCommands = false,
		}: NaticoCommandHandlerOptions
	) {
		super(client, {
			directory,
		});
		this.handleSlashCommands = handleSlashCommands;
		this.commandUtil = commandUtil;
		this.handleEdits = handleEdits;
		this.client = client;
		this.prefix = prefix;
		this.owners = owners;
		this.cooldown = cooldown;
		this.superusers = [...owners, ...superusers];
		this.ignoreCD = [...ignoreCD, ...this.superusers];
		this.cooldowns = new Collection();
		this.guildonly = guildonly;
		this.modules = new Collection();
		this.generator = new ArgumentGenerator(this.client);
		this.subType = subType;
		this.commandUtils = new Collection();
		this.storeMessages = storeMessages;
		this.mentionPrefix = mentionPrefix;
		this.modules = new Collection<string, MacroCommand | MacroSub>();
		this.start();
	}

	get categories() {
		const categories = new Collection<
			string,
			Collection<string, MacroCommand>
		>();

		for (const data of this.modules.values()) {
			if (data instanceof MacroSub == false) {
				const exists = categories.get(data.category!);
				if (exists) exists.set(data.id, data as MacroCommand);
				else {
					const cc = new Collection<string, MacroCommand>();
					cc.set(data.id, data as MacroCommand);
					categories.set(data.category!, cc);
				}
			}
		}
		for (const [name, cate] of categories) {
			categories.set(name, new Collection([...cate.entries()].sort()));
		}
		return new Collection([...categories.entries()].sort());
	}

	register(mod: MacroCommand, filepath: string) {
		mod.filepath = filepath;
		mod.category = filepath.split('/').reverse()[1];
		if (
			this.client.suggestiononly &&
			['packages', 'fun', 'moderation', 'information', 'vip'].includes(
				mod.category
			)
		) {
			return;
		}
		mod.handler = this;
		mod.client = this.client;
		if (mod.init) mod.init();
		return this.modules.set(mod.id, mod);
	}

	getPrefix(guildId: BigInt) {
		return this.prefix as string[];
	}

	public async handleCommand(message: DiscordenoMessage) {
		if (!message?.content) return;
		if (message.isBot) return;

		const prefixes = this.getPrefix(message.guildId!);
		const parsedPrefixes = [];

		if (Array.isArray(prefixes)) parsedPrefixes.push(...prefixes);
		else parsedPrefixes.push(prefixes);
		if (this.mentionPrefix) parsedPrefixes.push(`<@!${botId}>`, `<@${botId}>`);

		for (const prefix of parsedPrefixes) {
			if (await this.prefixCheck(prefix, message)) return;
		}
		return this.emit('commandInvalid', message);
	}

	async prefixCheck(prefix: string, message: DiscordenoMessage) {
		if (message.content.toLowerCase().startsWith(prefix)) {
			const commandName = message.content
				.toLowerCase()
				.slice(prefix.length)
				.trim()
				.split(' ')[0];
			const command = this.findCommand(commandName);
			if (command) {
				if (command.slashOnly) return;
				if (this.commandUtil) {
					if (this.commandUtils.has(message.id)) {
						message.util = this.commandUtils.get(message.id)!;
					} else {
						message.util = new MacroCommandUtil(this, message);
						this.commandUtils.set(message.id, message.util);
					}
				}
				message.util?.setParsed({ prefix, alias: commandName });
				const args = message.content
					.slice(prefix.length)
					.trim()
					.slice(commandName.length)
					.trim();

				await this.runCommand(command, message, args);
				return true;
			}
		}
	}
	public findCommand(command: string | undefined): MacroCommand | undefined {
		return this.modules.find((cmd) => {
			if (cmd instanceof MacroSub) return false;
			if (cmd.name == command) {
				return true;
			}
			if (cmd.aliases) {
				if (cmd.aliases.includes(<string>command)) {
					return true;
				}
			}
			return false;
		}) as MacroCommand;
	}
	start() {
		if (this.handleEdits) {
			this.client.addEvent('messageUpdate');
			this.client.on('messageUpdate', (message: DiscordenoMessage) => {
				return this.handleCommand(message);
			});
		}
		if (this.handleSlashCommands) {
			this.client.addEvent('interactionCreate');
			this.client.on(
				'interactionCreate',
				async (data: SlashCommandInteraction) => {
					if (data.type === DiscordInteractionTypes.ApplicationCommand)
						return this.handleSlashCommand(
							await createNaticoInteraction(data, this)
						);
				}
			);
		}
		this.client.addEvent('messageCreate');
		this.client.on('messageCreate', (message: DiscordenoMessage) => {
			return this.handleCommand(message);
		});
	}
	// Code taken from https://github.com/discord-akairo/discord-akairo/blob/master/src/struct/commands/CommandHandler.js#L705
	// Modified to work with natico
	runCooldowns(message: DiscordenoMessage, command: MacroCommand) {
		const id = message.authorId;
		if (this.ignoreCD.includes(message.authorId)) return false;

		const time = command.cooldown != null ? command.cooldown : this.cooldown;
		if (!time) return false;

		const endTime = message.timestamp + time;

		if (!this.cooldowns.has(id)) this.cooldowns.set(id, {});

		if (!this.cooldowns.get(id)[command.id]) {
			this.cooldowns.get(id)[command.id] = {
				timer: setTimeout(() => {
					if (this.cooldowns.get(id)[command.id]) {
						clearTimeout(this.cooldowns.get(id)[command.id].timer);
					}
					this.cooldowns.get(id)[command.id] = null;

					if (!Object.keys(this.cooldowns.get(id)).length) {
						this.cooldowns.delete(id);
					}
				}, time),
				end: endTime,
				uses: 0,
			};
		}

		const entry = this.cooldowns.get(id)[command.id];

		if (entry.uses >= command.ratelimit) {
			const end = this.cooldowns.get(id)[command.id].end;
			const diff = end - message.timestamp;

			this.emit(CommandHandlerEvents.COOLDOWN, message, command, diff);
			return true;
		}

		entry.uses++;
		return false;
	}

	async commandChecks(
		command: MacroCommand,
		message: DiscordenoMessage,
		args: string | undefined
	) {
		if (this.inhibitorHandler) {
			if (
				await this.inhibitorHandler.runChecks(
					message,
					command as unknown as NaticoCommand
				)
			)
				return true;
		}

		const authorId = message.authorId.toString();
		if (!this.superusers.includes(message.authorId)) {
			//Otherwise you would get on cooldown
			if (command instanceof MacroCommand == false)
				if (this.cooldowns.has(authorId)) {
					if (!this.ignoreCD.includes(message.authorId)) {
						this.emit(CommandHandlerEvents.COOLDOWN, message, command, args);
						return true;
					}
				}

			if (this.guildonly) {
				if (!message.guildId) {
					this.emit(CommandHandlerEvents.GUILDONLY, message, command, args);
					return true;
				}
			}

			if (command.userPermissions) {
				const missingPermissions = await getMissingChannelPermissions(
					message!.channelId,
					message.authorId,
					command.userPermissions
				);
				if (missingPermissions[0]) {
					this.emit(
						CommandHandlerEvents.USERPERMISSIONS,
						message,
						command,
						args,
						missingPermissions
					);
					return true;
				}
			}
			if (command.clientPermissions) {
				const missingPermissions = await getMissingChannelPermissions(
					message!.channelId,
					botId,
					command.clientPermissions
				);
				if (missingPermissions[0]) {
					this.emit(
						CommandHandlerEvents.CLIENTPERMISSIONS,
						message,
						command,
						args,
						missingPermissions
					);
					return true;
				}
			}
		}
		if (this.runCooldowns(message, command)) {
			return true;
		}
		if (command.ownerOnly) {
			if (!this.owners.includes(message.authorId)) {
				this.emit(CommandHandlerEvents.OWNERONLY, message, command, args);
				return true;
			}
		}

		if (command.superUserOnly) {
			if (!this.superusers.includes(message.authorId)) {
				this.emit(CommandHandlerEvents.SUPERUSERRONLY, message, command, args);
				return true;
			}
		}
		return false;
	}

	public async runCommand(
		command: MacroCommand,
		message: DiscordenoMessage,
		args?: string
	) {
		if (await this.commandChecks(command, message, args)) return false;

		try {
			if (command?.options && args) {
				if (
					command?.options[0]?.type ==
					DiscordApplicationCommandOptionTypes.SubCommand
				) {
					const subName = args.split(' ')[0].toLowerCase();
					for (const option of command.options) {
						if (option.name === subName) {
							const mod = this.modules.find((mod) => {
								if (
									mod instanceof MacroSub &&
									mod.subOf == command.name &&
									mod.name == option.name
								) {
									return true;
								}

								return false;
							}) as MacroCommand;

							if (mod) {
								this.runCommand(
									mod,
									message,
									args.split(' ').slice(1).join(' ')
								);
								return;
							}
						}
					}
				}
			}

			let data = (await this.generator.handleArgs(
				command as unknown as NaticoCommand,
				message,
				args
			)) as any;

			if (command.options)
				data = await this.generator.handleMissingArgs(
					message,
					command as unknown as NaticoCommand,
					data
				);

			await this.execCommand(command, message, data);
		} catch (e: unknown) {
			this.emit('commandError', message, command, e);
		}
	}

	async enableSlash(guildID?: bigint) {
		const slashed = this.slashEnabled();
		await upsertSlashCommands(slashed, guildID);
		return slashed;
	}
	slashEnabled() {
		const commands: EditGlobalApplicationCommand[] = [];
		const data = this.modules.filter(
			(command) => (command.slash || false) && !(command instanceof MacroSub)
		) as Collection<string, MacroCommand>;
		data.forEach((command: MacroCommand) => {
			const slashdata: EditGlobalApplicationCommand = {
				name: command.name || command.id,
				description: command.description || 'no description',
			};
			const options: ApplicationCommandOption[] = [];
			if (command.options) {
				command.options.forEach((option) => {
					delete option['match'];
					delete option['customType'];
					options.push(option);
				});
			}
			if (command.options) slashdata['options'] = options;
			commands.push(slashdata);
		});
		return commands;
	}
	async handleSlashCommand(interaction: any) {
		const args: ConvertedOptions = {};
		if (interaction.util.data.interaction?.data?.options)
			for (const option of interaction.util.data.interaction.data?.options) {
				if (option?.value) {
					args[option.name] = option.value;
				}
			}
		const command = this.findCommand(
			interaction.util.data.interaction.data.name
		);
		if (!command) return;
		let sub: string | null = null;
		if (command?.options) {
			if (
				command?.options[0]?.type ==
				DiscordApplicationCommandOptionTypes.SubCommand
			) {
				sub = interaction.util.data.interaction.data?.options[0].name;
				if (interaction.util.data.interaction?.data?.options[0]?.options)
					for (const option of interaction.util.data.interaction.data
						?.options[0]?.options) {
						if (option?.value) {
							args[option.name] = option.value;
						}
					}
				for (const option of command.options) {
					if (option.name === sub) {
						const mod = this.modules.find((mod) => {
							if (
								mod instanceof MacroSub &&
								mod.subOf == command.name &&
								mod.name == option.name
							) {
								return true;
							}
							return false;
						});
						if (mod) {
							return await this.execCommand(mod, interaction, args);
						}
					}
				}
			}
		}
		await this.execCommand(command, interaction, args);
	}

	async execCommand(
		command: MacroCommand | MacroSub,
		message: DiscordenoMessage,
		args: ConvertedOptions
	) {
		try {
			this.emit('commandStarted', message, command, args);
			const res = await command.exec(message, args);
			this.emit('commandEnded', message, command, args, res);
		} catch (e) {
			this.emit('commandError', message, command, e);
		}
	}
	setInhibitorHandler(inhibitorHandler: NaticoInhibitorHandler) {
		this.inhibitorHandler = inhibitorHandler;
	}
}
