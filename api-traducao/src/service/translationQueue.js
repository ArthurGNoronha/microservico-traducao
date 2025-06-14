import amqp from 'amqplib';

const QUEUE_NAME = 'translations';

export default async function publishTranslation(message) {
  let connection;
  try {
    connection = await amqp.connect(process.env.RABBITMQ || 'amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
    await channel.close();
  } catch (err) {
    throw new Error(err.message);
  } finally {
    if (connection) await connection.close();
  }
}