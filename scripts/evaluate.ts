import { db } from '../src/db/index';
import { fastTierRecommender } from '../src/recommendation/fastTier';
import { ContextParams } from '../src/recommendation/routing';

async function runEvaluation() {
  console.log("Fetching users and preferences from database...");
  const usersRes = await db.query('SELECT u.id, u.full_name, up.allergies, up.favorite_flavors, up.dietary_restrictions FROM users u JOIN user_preferences up ON u.id = up.user_id');
  
  let totalUsers = usersRes.rows.length;
  let totalRecommendations = 0;
  let validRecommendations = 0;
  let totalVectorScore = 0;

  console.log(`Found ${totalUsers} users for testing.`);

  for (const row of usersRes.rows) {
    const userId = row.id;
    const allergies = typeof row.allergies === 'string' ? JSON.parse(row.allergies) : row.allergies;
    const favoriteFlavors = typeof row.favorite_flavors === 'string' ? JSON.parse(row.favorite_flavors) : row.favorite_flavors;
    const diet = typeof row.dietary_restrictions === 'string' ? JSON.parse(row.dietary_restrictions) : row.dietary_restrictions;

    const context: ContextParams = {
      location: { lat: 21.0319, lng: 105.8465 }, // Center Hanoi
      time: new Date()
    };

    try {
      const recs = await fastTierRecommender.getRecommendations(userId, context);
      
      console.log(`\nUser: ${row.full_name} | Allergies: ${allergies.join(',')} | Flavors: ${favoriteFlavors.join(',')}`);
      
      if (recs.length === 0) {
        console.log("  No recommendations found (Check Qdrant DB!).");
        continue;
      }

      for (const rec of recs) {
        totalRecommendations++;
        const dishAllergies = rec.payload.ingredients as string[] || [];
        
        let isValid = true;
        // Check 1: Should not contain allergies
        for (const allergy of allergies) {
          if (dishAllergies.includes(allergy)) {
            console.log(`  [FAIL] Dish "${rec.name}" contains allergen: ${allergy}`);
            isValid = false;
          }
        }
        
        // Add more checks if needed, like diet checking
        if (isValid) {
          validRecommendations++;
          totalVectorScore += rec.vectorScore;
          console.log(`  [PASS] Dish "${rec.name}" (Ingredients: ${dishAllergies.join(', ')}) - FlavorMatch (Vector): ${(rec.vectorScore * 100).toFixed(1)}% | FinalScore: ${rec.finalScore.toFixed(3)}`);
        }
      }
    } catch (error) {
      console.error(`Error processing user ${userId}:`, error);
    }
  }

  const allergyAccuracy = totalRecommendations > 0 ? (validRecommendations / totalRecommendations) * 100 : 0;
  const avgFlavorMatch = validRecommendations > 0 ? (totalVectorScore / validRecommendations) * 100 : 0;

  console.log(`\n=== EVALUATION REPORT ===`);
  console.log(`Total Users Evaluated: ${totalUsers}`);
  console.log(`Total Recommendations: ${totalRecommendations}`);
  console.log(`Valid Recommendations (No Allergies): ${validRecommendations}`);
  console.log(`Allergy Avoidance Accuracy: ${allergyAccuracy.toFixed(2)}%`);
  console.log(`Average Flavor Match (AI Vector Similarity): ${avgFlavorMatch.toFixed(2)}%`);


  await db.end();
  // also close the global db pool used by fastTierRecommender if needed
  process.exit(0);
}

runEvaluation().catch(console.error);
