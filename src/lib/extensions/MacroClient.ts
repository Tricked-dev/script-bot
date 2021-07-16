import {
	NaticoClient,
	NaticoClientOptions,
	NaticoListenerHandler,
	cache,
	Collection,
	botId,
	sendWebhook,
	ExecuteWebhook,
	dbcon,
	Pool,
	PoolClient,
	NaticoTaskHandler,
	NaticoInhibitorHandler,
	DiscordenoMember,
	ComponentInteraction,
	suggestiononly,
	Argument,
} from '../../../deps.ts';
import { MacroLogger } from '../classes/logger.ts';
import { tokens } from '../../../settings.ts';
import { join } from '../functions/join.ts';
import { MacroUtil, MacroCommandHandler } from './mod.ts';
import { parseUser } from '../functions/getMember.ts';
type Responder = (
	interaction: ComponentInteraction,
	member: DiscordenoMember,
	id: string[]
) => any | Promise<any>;
/***
 * The amazing macro client everyone would want in their discord but doesnt know
 * sssssssssssssssshhhhhhhhhhhhhhhh
 * dont leak
 */
export class MacroClient extends NaticoClient {
	suggestiononly?: boolean;
	constructor(options?: NaticoClientOptions) {
		super(options);
		if (suggestiononly) this.suggestiononly = true;
	}
	/*** Make this file if it errors */
	fileloaderPath = Deno.realPathSync('fileloader.ts');
	/*** Some path i dunno */
	paths: string[] = [];
	/*** I AM SPEED! */
	uniqueFilePathCounter = 0;
	/*** Used to connect to the database */
	dbPool = new Pool(dbcon, 20, true);
	/*** All tokens very useful 10/10 */
	tokens = tokens;
	/*** Borred from the template */
	buttonCollectors = new Collection<any, any>();
	/*** Borred from the template */
	messageCollectors = new Collection<any, any>();
	/*** Borred from the template */
	reactionCollectors = new Collection<any, any>();
	/*** Responders to interactions, putting it all in one version aint the way chief */
	interactionResponders = new Collection<string, Responder>();
	/*** Just a number from when the bot client is made not actually started but who cares! */
	ready = Date.now();
	/*** Webhook to shitpost to */
	logs = (options: ExecuteWebhook) =>
		sendWebhook(tokens.logs.id, tokens.logs.token, options);
	/*** Webhook to shitpost to but more important */
	error = (options: ExecuteWebhook) =>
		sendWebhook(tokens.error.id, tokens.error.token, options);
	/***Exclusive macro logs */
	logger: MacroLogger = new MacroLogger(this);
	/*** Macro utils */
	util = new MacroUtil(this);
	/*** Shortcut to cache */
	cache = cache;
	/*** Command handler */
	commandHandler: MacroCommandHandler = new MacroCommandHandler(this, {
		directory: join(Deno.cwd(), 'src', 'commands'),
		prefix: ['.'],
		owners: [336465356304678913n, 550120331503992842n],
		ignoreCD: [
			590224302578860065n,
			834741487592931328n,
			768757813550907392n,
			237697797745278976n,
			150427554166210560n,
			478835171282518019n,
			550120331503992842n,
		],
		cooldown: 10000,
		handleEdits: true,
		guildonly: true,
		handleSlashCommands: true,
		subType: 'single',
	});

	/*** Nice ip bro */
	get id() {
		return botId;
	}
	/*** Shortcut */
	get user(): DiscordenoMember {
		return this.cache.members.get(this.id) as DiscordenoMember;
	}
	/*** Listener handler */
	listenerHandler: NaticoListenerHandler = new NaticoListenerHandler(this, {
		directory: join(Deno.cwd(), 'src', 'listeners'),
	});
	/*** Listener handler */
	taskHandler: NaticoTaskHandler = new NaticoTaskHandler(this, {
		directory: join(Deno.cwd(), 'src', 'tasks'),
	});
	/*** Inhibitor handler */
	inhibitorHandler: NaticoInhibitorHandler = new NaticoInhibitorHandler(this, {
		directory: join(Deno.cwd(), 'src', 'inhibitors'),
	});
	/*** Imports the file loader path */
	async fileLoader() {
		await Deno.writeFile(
			this.fileloaderPath,
			new TextEncoder().encode(this.paths.join('\n'))
		);
		await import(this.fileloaderPath);
		this.paths = [];
	}
	/*** Writes intpo the file loader path */
	async importDirectory(path: string) {
		const files = Deno.readDirSync(Deno.realPathSync(path));

		for (const file of files) {
			if (!file.name) continue;

			const currentPath = `${path}/${file.name}`;
			if (file.isFile) {
				if (!currentPath.endsWith('.ts')) continue;
				this.paths.push(`import "file://${currentPath}";`);
				continue;
			}

			await this.importDirectory(currentPath);
		}

		this.uniqueFilePathCounter++;
	}
	/** RUN QUERIES */
	async query<T extends Record<string, unknown>>(
		query: string,
		params?: Array<any>
	): Promise<Array<T>> {
		const client: PoolClient = await this.dbPool.connect();
		if (!query.includes('temproles'))
			this.logger.debug(`[QUERYRAN] ${query.slice(0, 120)}`);
		const dbResult = await client.queryObject<T>({
			text: query,
			args: params,
		});
		client.release();

		return dbResult.rows;
	}
	/** sets the globalThis things to null to decrease memory usage */
	postLoaders() {
		//@ts-ignore -
		globalThis.createCommand = null;
		//@ts-ignore -
		globalThis.createEvent = null;
		//@ts-ignore -
		globalThis.createInhibitor = null;
		//@ts-ignore -
		globalThis.createTask = null;
	}
	/**Loads all files */
	async loaders() {
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			taskHandler: this.taskHandler,
		});
		this.logger.debug(`[LOADING FILES]`);
		await Promise.all(
			[
				this.commandHandler.directory,
				this.listenerHandler.directory,
				this.taskHandler.directory,
				this.inhibitorHandler.directory,
			].map((path) => this.importDirectory(Deno.realPathSync(path)))
		);
		this.logger.debug(`[LOADED FILES]`);
		this.commandHandler.setInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.generator.arguments.set('6', parseUser as Argument);
		await this.util.init();
		this.logger.debug(`[LOADED CACHE]`);
		await this.fileLoader();
		this.postLoaders();
	}
	/*** Used to start the client */
	async start() {
		await this.loaders();
		return this.login();
	}
}
