/**
 * Twitter Epoch, used as the default epoch. (1288834974657 -> Nov 04 2010 01:42:54)
 */
export const TWITTER_EPOCH = 1288834974657;

/** The sequence to generate a Snowflake ID. Become 0 when the value reach 4096.*/
export let sequence = 0;

/** Represents a deconstructed Snowflake */
export interface MeltedSnowflake {
  /** Timestamp the Snowflake was created */
  timestamp: number;
  /** The ID of the process that generate the Snowflake ID. */
  processID: number;
  /** The ID of the worker that generate the Snowflake ID. */
  workerID: number;
  /** Sequence in the Snowflake */
  sequence: number;
  /** The used Epoch in the Snowflake */
  epoch: number;
  /** Binary representation of the Snowflake ID */
  binary: string;
  /** The Snowflake ID as a string */
  stringID: string;
  /** The Snowflake ID as a BigInt */
  bigIntID: bigint;
  /** The Date the Snowflake was created */
  date: Date;
}

/** Options to generate a Snowflake ID */
export interface SnowflakeIDGeneratorOptions {
  /** The timestamp of the Snowflake ID generation. By default, we recommend `Date.now` */
  timestamp?: number;
  /** The Epoch used for the Snowflake ID generation. By default, we use the Twitter Epoch (`1288834974657`) */
  epoch?: number;
  /** The ID of the process that generate the Snowflake ID. By default this is 0 */
  processID?: number;
  /** The ID of the worker that generate the Snowflake ID. By default this is 1 */
  workerID?: number;
}

/** Deconstructs (melts) a Snowflake ID and returns its information */
const EPOCH = 1420070400000;
let INCREMENT = 0;
export function snowflakeToTimestamp(id: bigint) {
  return Number(id / 4194304n + 1420070400000n);
}

export function binaryToID(num: any) {
  let dec = "";

  while (num.length > 50) {
    const high = parseInt(num.slice(0, -32), 2);
    const low = parseInt((high % 10).toString(2) + num.slice(-32), 2);

    dec = (low % 10).toString() + dec;
    num =
      Math.floor(high / 10).toString(2) +
      Math.floor(low / 10)
        .toString(2)
        .padStart(32, "0");
  }

  num = parseInt(num, 2);
  while (num > 0) {
    dec = (num % 10).toString() + dec;
    num = Math.floor(num / 10);
  }

  return dec;
}
export function generate(timestamp = Date.now()) {
  if (typeof timestamp !== "number" || isNaN(timestamp)) {
    throw new TypeError(
      `"timestamp" argument must be a number (received ${isNaN(timestamp) ? "NaN" : typeof timestamp})`
    );
  }
  if (INCREMENT >= 4095) INCREMENT = 0;
  const BINARY = `${(timestamp - EPOCH).toString(2).padStart(42, "0")}0000100000${(INCREMENT++)
    .toString(2)
    .padStart(12, "0")}`;
  return binaryToID(BINARY);
}
