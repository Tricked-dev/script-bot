import { ddMessage } from '../../../../deps.ts';
import { MacroCommandUtil } from './MacroCommandUtil.ts';
export interface MacroMessage extends ddMessage {
	util: MacroCommandUtil;
}
