import { NaticoCommand, NaticoCommandOptions } from '../../../../deps.ts';
import { MacroClient } from '../MacroClient.ts';
import { MacroCommandHandler } from '../../classes/MacroCommandHandler.ts';
interface CommandOptions extends NaticoCommandOptions {
	usage?: string;
	slashOnly?: boolean;
}
export abstract class MacroCommand extends NaticoCommand {
	declare client: MacroClient;
	declare category: string;
	//@ts-ignore -
	declare handler: MacroCommandHandler;
	usage?: string;
	slashOnly?: boolean;
	constructor(
		id: string,
		{
			name,
			aliases,
			examples,
			description,
			slash,
			category,
			ownerOnly,
			superUserOnly,
			options,
			clientPermissions,
			userPermissions,
			usage,
			slashOnly,
		}: CommandOptions
	) {
		super(id, {
			name,
			aliases,
			examples,
			description,
			slash,
			category,
			ownerOnly,
			superUserOnly,
			options,
			clientPermissions,
			userPermissions,
		});
		this.slashOnly = slashOnly;
		this.usage = usage;
	}
	init(): any {}
}
