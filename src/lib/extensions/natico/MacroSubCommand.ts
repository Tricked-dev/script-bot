import { NaticoSubCommand } from '../../../../deps.ts';
import { MacroClient } from '../MacroClient.ts';
import { MacroCommandHandler } from '../../classes/MacroCommandHandler.ts';
export class MacroSub extends NaticoSubCommand {
	declare client: MacroClient;
	//@ts-ignore -
	declare handler: MacroCommandHandler;
	slashOnly!: boolean;
}
