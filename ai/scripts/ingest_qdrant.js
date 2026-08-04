const { QdrantClient } = require('@qdrant/js-client-rest');
const fs = require('fs');

async function main() {
  console.log("Connecting to Qdrant at localhost:6333...");
  const client = new QdrantClient({ host: 'localhost', port: 6333 });
  
  const collectionName = "dishes";

  try {
    // Read the generated embeddings
    console.log("Loading dish_embeddings.json...");
    const data = JSON.parse(fs.readFileSync('dish_embeddings.json', 'utf8'));

    // Check if collection exists
    const result = await client.getCollections();
    const exists = result.collections.find(c => c.name === collectionName);
    
    if (!exists) {
      console.log(`Creating collection '${collectionName}'...`);
      await client.createCollection(collectionName, {
        vectors: {
          size: 384, // MiniLM-L6-v2 dimension
          distance: 'Cosine'
        }
      });
    } else {
      console.log(`Collection '${collectionName}' already exists.`);
    }

    console.log(`Ingesting ${data.length} vectors...`);
    
    // Process in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      const points = batch.map(dish => ({
        id: dish.id,
        vector: dish.embedding,
        payload: {
          name: dish.name,
          ingredients: dish.ingredients
        }
      }));
      
      await client.upsert(collectionName, {
        wait: true,
        points: points
      });
      console.log(`Ingested ${i + batch.length}/${data.length}`);
    }
    
    console.log("Ingestion completed successfully!");
    
  } catch (err) {
    console.error("Error during ingestion:", err);
  }
}

main();
