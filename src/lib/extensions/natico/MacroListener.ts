import { NaticoListener } from '../../../../deps.ts';
import { MacroClient } from '../MacroClient.ts';
export class MacroListener extends NaticoListener {
	declare client: MacroClient;
}
