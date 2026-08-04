// Mock kafkajs import to prevent compilation errors if not installed
// In a real scenario, this would be: import { Kafka, Producer } from 'kafkajs';
class MockKafka {
  producer() {
    return {
      connect: async () => console.log('Mock Kafka Producer connected'),
      send: async (record: any) => console.log(`Mock Kafka message sent to ${record.topic}: ${JSON.stringify(record.messages)}`),
      disconnect: async () => console.log('Mock Kafka Producer disconnected')
    };
  }
}

const kafka = new MockKafka(); // Replace with new Kafka({ clientId: 'food-app', brokers: ['localhost:9092'] })
const producer = kafka.producer();

export const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka Producer connected successfully');
  } catch (error) {
    console.error('Failed to connect Kafka Producer', error);
  }
};

export const disconnectProducer = async () => {
  await producer.disconnect();
};

export const emitSwipeEvent = async (userId: string, restaurantId: string, dishId: string, action: 'like' | 'skip') => {
  try {
    await producer.send({
      topic: 'user-swipe-events',
      messages: [
        {
          key: userId,
          value: JSON.stringify({
            userId,
            restaurantId,
            dishId,
            action,
            timestamp: new Date().toISOString()
          })
        }
      ]
    });
  } catch (error) {
    console.error('Error emitting swipe event', error);
  }
};
