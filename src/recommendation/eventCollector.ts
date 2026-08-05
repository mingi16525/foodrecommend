import { Kafka, Producer, Consumer } from 'kafkajs';
import { featureStore } from './featureStore';

export class EventCollector {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private isConnected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'foodrecommend-app',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      retry: {
        initialRetryTime: 100,
        retries: 3
      }
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'feature-store-updater' });
  }

  public async connect() {
    try {
      console.log('[EventCollector] Connecting to Kafka...');
      await this.producer.connect();
      await this.consumer.connect();
      this.isConnected = true;
      console.log('[EventCollector] Successfully connected to Kafka.');
      
      // Khởi động luồng ngầm (Consumer) lắng nghe event để tự động update
      this.startConsumer();
    } catch {
      console.warn('[EventCollector] Kafka connection failed. Falling back to local direct updates.');
      this.isConnected = false;
    }
  }

  private async startConsumer() {
    if (!this.isConnected) return;

    try {
      await this.consumer.subscribe({ topic: 'swipe-events', fromBeginning: false });
      await this.consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;
          try {
            const eventData = JSON.parse(message.value.toString());
            // Gọi FeatureStore để cập nhật
            await featureStore.updateUserFeatures(eventData.userId, eventData.dishId, eventData.action);
          } catch (e) {
            console.error('[EventCollector] Error processing message:', e);
          }
        },
      });
    } catch (e) {
      console.error('[EventCollector] Consumer error:', e);
    }
  }

  public async trackSwipe(userId: string, dishId: string, action: 'like' | 'skip') {
    const eventPayload = {
      userId,
      dishId,
      action,
      timestamp: new Date().toISOString()
    };

    if (this.isConnected) {
      try {
        await this.producer.send({
          topic: 'swipe-events',
          messages: [{ value: JSON.stringify(eventPayload) }],
        });
        console.log(`[EventCollector] Pushed event to Kafka: ${action} by ${userId}`);
      } catch (e) {
        console.error('[EventCollector] Failed to push event:', e);
        // Fallback
        await featureStore.updateUserFeatures(userId, dishId, action);
      }
    } else {
      // Nếu không có Kafka, gọi trực tiếp để giả lập luồng
      console.log(`[EventCollector] Kafka disconnected. Applying local direct update.`);
      await featureStore.updateUserFeatures(userId, dishId, action);
    }
  }
}

export const eventCollector = new EventCollector();
// Mở kết nối ngầm khi server khởi động
eventCollector.connect().catch(console.error);
