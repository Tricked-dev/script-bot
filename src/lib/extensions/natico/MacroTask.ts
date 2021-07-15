import { NaticoTask } from '../../../../deps.ts';
import { MacroClient } from '../MacroClient.ts';
export abstract class MacroTask extends NaticoTask {
	declare client: MacroClient;
}
