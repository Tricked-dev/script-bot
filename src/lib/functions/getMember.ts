import { DiscordenoMessage, fetchMembers } from "../../../deps.ts";
export async function parseUser(message: DiscordenoMessage, args: string) {
  const item = args.trim().split(" ")[0].replace(/ /gi, "");

  const reg = /(\d{17,20})/;
  const id = args.match(reg);

  let user = message.guild!.members.find((member) => {
    if (id && member.id == BigInt(id[1])) return true;

    if (!item.length) return false;
    if (member.name(message.guildId).toLowerCase().includes(item)) {
      return true;
    }
    if (member.tag.toLowerCase().includes(item)) true;
    return false;
  });

  if (user) return [user, args.ssj(" ", 1)];
  if (item || (id && id[1]))
    user = (
      await fetchMembers(message?.guild?.id!, message.guild?.shardId!, {
        userIds: id && id[1] ? [BigInt(id[1])] : undefined,
        query: id && id[1] ? undefined : item,
        limit: 1,
      }).catch(() => undefined)
    )?.first();

  return [user, args.ssj(" ", 1)];
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
