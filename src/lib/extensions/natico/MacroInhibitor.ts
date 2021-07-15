import { NaticoInhibitor } from '../../../../deps.ts';
import { MacroClient } from '../MacroClient.ts';
export abstract class MacroInhibitor extends NaticoInhibitor {
	declare client: MacroClient;
}
