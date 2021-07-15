import { DiscordenoMessage, NaticoListener, CommandHandlerEvents, NaticoCommand } from "../../../deps.ts";
@globalThis.createEvent
export default class commandStarted extends NaticoListener {
  constructor() {
    super("commandStarted", {
      emitter: "commandHandler",
      event: CommandHandlerEvents.COOLDOWN,
    });
  }

  exec(message: DiscordenoMessage, _: NaticoCommand, timeLeft: number) {
    const embed = this.client.util
      .embed()
      .setColor("#f63c02")
      .setTitle("Cooldown")
      .setDescription(`Your on cooldown for ${(timeLeft / 1000).toFixed(1).replace(`-0.0`, "0.1")} seconds`);
    return message.util.send({ embeds: [embed] });
  }
}
