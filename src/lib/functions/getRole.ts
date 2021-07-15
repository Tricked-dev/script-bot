import { DiscordenoMessage, fetchMembers } from "../../../deps.ts";
export function parseRole(message: DiscordenoMessage, args: string) {
  const item = args.trim().split(" ")[0].replace(/ /gi, "");

  const reg = /<@!?(\d{17,19})>/;
  const id = args.match(reg);

  let role = message.guild!.roles.find((role) => {
    if (item == role.id.toString()) return true;
    if (id && role.id == BigInt(id[1])) return true;
    if (!item.length) return false;
    if (role.name.toLowerCase().includes(item)) {
      return true;
    }
    return false;
  });

  return [role, args.ssj(" ", 1)];
}
String.prototype.ssj = function (split: string, slices: number, join?: string) {
  return this.split(split)
    .slice(slices)
    .join(join ?? split);
};
declare global {
  interface String {
    ssj(split: string, slices: number, join?: string): string;
  }
}
