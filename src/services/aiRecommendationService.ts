import { MenuItem } from '../types';

export interface DishRecommendation {
  dish: MenuItem;
  pairingReason: string;
  source: 'gemini' | 'culinary-rules';
}

export interface RecommendationResult {
  recommendations: DishRecommendation[];
  source: 'gemini' | 'culinary-rules';
  isLoading?: boolean;
  error?: string;
}

/**
 * Intelligent local culinary pairing fallback logic
 * (Guarantees immediate recommendations if server or network is slow)
 */
function getRuleBasedPairings(dish: MenuItem, allMenuItems: MenuItem[]): DishRecommendation[] {
  const otherItems = allMenuItems.filter((m) => m.id !== dish.id && m.isAvailable !== false);
  const cat = (dish.category || '').toLowerCase();
  const name = dish.name.toLowerCase();

  const results: DishRecommendation[] = [];

  // Helper to find item by category or keywords
  const findItem = (predicate: (item: MenuItem) => boolean) =>
    otherItems.find((it) => !results.some((r) => r.dish.id === it.id) && predicate(it));

  // Rule 1: Curries / Gravies (Chicken, Mutton, Paneer, Mushroom, Vegetable, Egg, Fish, Prawn)
  if (
    cat.includes('chicken') ||
    cat.includes('mutton') ||
    cat.includes('paneer') ||
    cat.includes('mushroom') ||
    cat.includes('vegetable') ||
    cat.includes('egg') ||
    cat.includes('fish') ||
    cat.includes('prawn')
  ) {
    // Pair 1: Breads / Tandoori
    const bread =
      findItem((it) => it.category.toLowerCase().includes('tandoori') || it.name.toLowerCase().includes('naan') || it.name.toLowerCase().includes('roti')) ||
      findItem((it) => it.category.toLowerCase().includes('biryani') || it.name.toLowerCase().includes('rice'));

    if (bread) {
      results.push({
        dish: bread,
        pairingReason: `Fresh, warm ${bread.name} is the quintessential partner to scoop up the rich, aromatic gravy of ${dish.name}.`,
        source: 'culinary-rules',
      });
    }

    // Pair 2: Rice or Cooling Drinks/Salad
    const riceOrBeverage =
      findItem((it) => it.category.toLowerCase().includes('rice') || it.name.toLowerCase().includes('jeera rice')) ||
      findItem((it) => it.category.toLowerCase().includes('soft drinks') || it.category.toLowerCase().includes('salad'));

    if (riceOrBeverage) {
      results.push({
        dish: riceOrBeverage,
        pairingReason: `${riceOrBeverage.name} balances the bold Indian spices with clean, complementary comfort.`,
        source: 'culinary-rules',
      });
    }
  }

  // Rule 2: Biryani / Rice Dishes
  else if (cat.includes('biryani') || cat.includes('fried rice') || cat.includes('meals')) {
    const beverageOrSide =
      findItem((it) => it.category.toLowerCase().includes('salad') || it.name.toLowerCase().includes('raita')) ||
      findItem((it) => it.category.toLowerCase().includes('soft drinks') || it.category.toLowerCase().includes('papad'));

    if (beverageOrSide) {
      results.push({
        dish: beverageOrSide,
        pairingReason: `Crisp and refreshing ${beverageOrSide.name} cuts through the slow-cooked basmati spices delightfully.`,
        source: 'culinary-rules',
      });
    }

    const starterOrKebab =
      findItem((it) => it.category.toLowerCase().includes('tandoori') || it.category.toLowerCase().includes('pakoda') || it.category.toLowerCase().includes('chicken'));

    if (starterOrKebab) {
      results.push({
        dish: starterOrKebab,
        pairingReason: `Smoky, succulent ${starterOrKebab.name} elevates your Biryani into a regal banquet.`,
        source: 'culinary-rules',
      });
    }
  }

  // Rule 3: Chinese / Noodles / Chowmein / Rolls
  else if (cat.includes('noodles') || cat.includes('roll') || name.includes('chowmein')) {
    const soup = findItem((it) => it.category.toLowerCase().includes('soup'));
    if (soup) {
      results.push({
        dish: soup,
        pairingReason: `Warm, flavorful ${soup.name} creates an authentic Indo-Chinese restaurant pairing with ${dish.name}.`,
        source: 'culinary-rules',
      });
    }

    const starter = findItem((it) => it.category.toLowerCase().includes('pakoda') || it.name.toLowerCase().includes('chilli') || it.name.toLowerCase().includes('manchurian'));
    if (starter) {
      results.push({
        dish: starter,
        pairingReason: `Zesty and crunchy ${starter.name} adds the perfect texture contrast.`,
        source: 'culinary-rules',
      });
    }
  }

  // Fallback Rule: Grab top popular complementary items
  while (results.length < 2 && otherItems.length > 0) {
    const fallbackItem = findItem((it) => it.isPopular || it.category !== dish.category);
    if (!fallbackItem) break;
    results.push({
      dish: fallbackItem,
      pairingReason: `One of our chef's highest-rated dishes that harmonizes wonderfully alongside ${dish.name}.`,
      source: 'culinary-rules',
    });
  }

  return results.slice(0, 2);
}

/**
 * Fetches AI-powered complementary dishes from server-side Gemini
 * with intelligent culinary fallback.
 */
export async function getAiSuggestedSimilar(
  dish: MenuItem,
  allMenuItems: MenuItem[]
): Promise<RecommendationResult> {
  const fallbackPairings = getRuleBasedPairings(dish, allMenuItems);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch('/api/gemini/suggest-similar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dish: {
          id: dish.id,
          name: dish.name,
          category: dish.category,
          description: dish.description,
          isVeg: dish.isVeg,
        },
        menu: allMenuItems.slice(0, 35).map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category,
          price: m.price,
          isVeg: m.isVeg,
        })),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        const itemMap = new Map(allMenuItems.map((it) => [it.id, it]));
        const aiMatched: DishRecommendation[] = [];

        for (const rec of data.recommendations) {
          const matchedItem = itemMap.get(rec.dishId) || allMenuItems.find((m) => m.name.toLowerCase() === (rec.dishName || '').toLowerCase());
          if (matchedItem && matchedItem.id !== dish.id) {
            aiMatched.push({
              dish: matchedItem,
              pairingReason: rec.pairingReason || `Pairs wonderfully with ${dish.name}.`,
              source: 'gemini',
            });
          }
        }

        if (aiMatched.length >= 2) {
          return {
            recommendations: aiMatched.slice(0, 2),
            source: 'gemini',
          };
        }
      }
    }
  } catch (err) {
    console.warn('[AI Recommendations] Falling back to culinary engine:', err);
  }

  return {
    recommendations: fallbackPairings,
    source: 'culinary-rules',
  };
}
