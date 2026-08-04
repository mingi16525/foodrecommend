const { pipeline } = require('@xenova/transformers');
const { Client } = require('pg');
const fs = require('fs');

async function main() {
  console.log("Loading model: all-MiniLM-L6-v2...");
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  console.log("Connecting to Database...");
  const client = new Client({
    host: 'localhost',
    user: 'fooduser',
    password: 'foodpassword',
    database: 'foodrecommend',
    port: 5432,
  });

  try {
    await client.connect();
    console.log("Fetching dishes...");
    const res = await client.query('SELECT id, name, ingredients FROM dishes');
    const dishes = res.rows;
    console.log(`Found ${dishes.length} dishes.`);

    const output = [];

    // Processing in batches
    for (let i = 0; i < dishes.length; i++) {
      const dish = dishes[i];
      // Create a semantic text representation
      const textToEmbed = `Dish: ${dish.name}. Ingredients: ${JSON.stringify(dish.ingredients)}`;
      
      const embedding = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
      
      output.push({
        id: dish.id,
        name: dish.name,
        ingredients: dish.ingredients,
        embedding: Array.from(embedding.data)
      });
      
      if (i % 50 === 0) {
        console.log(`Processed ${i}/${dishes.length} embeddings...`);
      }
    }

    // Output to JSON so ingest script can use it, or we can ingest directly if we wanted.
    fs.writeFileSync('dish_embeddings.json', JSON.stringify(output, null, 2));
    console.log("Successfully generated embeddings and saved to dish_embeddings.json");
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();
