export interface Tags extends Record<string, unknown> {
  id: bigint;
  name: string;
  guild: bigint;
  cointent: string;
}
export interface guilds extends Record<string, unknown> {
  id: bigint;
  prefix: string[];
  language: string;
  githubchannel: bigint;
  repos: string[];
  vip: boolean;
  supportchannel: bigint;
  supportmessage: string;
  supporttitle: string;
  modlogs: bigint;
  suggestionchannel: bigint;
  publish: bigint[];
  deniedchannel: bigint;
}
export interface Guildd {
  id: bigint;
  prefix: string[];
  language: string;
  githubchannel: bigint;
  repos: string[];
  vip: boolean;
  supportchannel: bigint;
  supportmessage: string;
  supporttitle: string;
  modlogs: bigint;
  suggestionchannel: bigint;
  deniedchannel: bigint;
  acceptedchannel: bigint;
  publish: bigint[];
  emojis: bigint[];
}
export interface users extends Record<string, unknown> {
  id: bigint;
  iq: number;
  votes: number;
}

export interface Temproles extends Record<string, unknown> {
  role: bigint;
  id: bigint;
  guildid: bigint;
  expires: number;
}
