import amqp from "amqplib";

export default async function connection(queue, exchange, routingKey, callback) {
  const RABBITMQ = process.env.RABBITMQ || "amqp://localhost";
  const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || "3");

  try {
    const conn = await amqp.connect(RABBITMQ);
    const channel = await conn.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await conn.close();
    });

    await channel.assertQueue(queue, { durable: true });
    await channel.assertQueue(`${queue}_dlq`, { durable: true });

    await channel.assertExchange(exchange, "direct", { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);
    await channel.bindQueue(`${queue}_dlq`, exchange, "dlq");

    await channel.consume(
      queue,
      async (message) => {
        const content = message.content.toString();
        const retries = message.properties.headers?.["x-retries"] || 0;

        try {
          console.log("==> Mensagem recebida:", content);
          console.log("===> Quantidade de tentativas:", retries);

          await callback(JSON.parse(content));
          console.log("====> Mensagem processada!");
        } catch (err) {
          if (retries < MAX_RETRIES) {
            console.log("====> Realizando outra tentativa!");
            channel.sendToQueue(queue, Buffer.from(content), {
              headers: { "x-retries": retries + 1 },
              persistent: true,
            });
          } else {
            console.log("====> Mensagem enviada para DLQ!");
            channel.publish(exchange, "dlq", Buffer.from(content), {
              headers: { "x-retries": retries },
              persistent: true,
            });
          }
        } finally {
          channel.ack(message);
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error(err);
  }
}