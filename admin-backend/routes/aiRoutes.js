const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// Note: Using native fetch (Node 18+) or you can install node-fetch/axios
// Since common modern node environments have fetch, we'll try that first.

router.use(protect, adminOnly);

router.post('/suggest', async (req, res) => {
  try {
    const { productId, currentName, currentDescription, currentCategories } = req.body;
    
    // 1. Fetch available products (inventory) to provide context to AI
    // We limit to 200 products to avoid huge token costs while still giving enough variety
    const products = await Product.find({ _id: { $ne: productId } })
      .select('name categories _id')
      .limit(200);

    const inventoryList = products.map(p => `${p.name} (ID: ${p._id})`).join(', ');

    // 2. Construct Prompt for Groq
    const prompt = `
      You are an e-commerce sales expert assistant.
      A customer is looking at: "${currentName}".
      Description: "${currentDescription}"
      Categories: ${currentCategories.join(', ')}

      From the following inventory list, select exactly 5 most relevant "Frequently Bought Together" or "Similar" products.
      Return ONLY a JSON array of the IDs. No explanation.
      
      Inventory: ${inventoryList}
    `;

    // 3. Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
       console.error("Groq AI Error Response:", data);
       throw new Error(data.error?.message || "AI failed to respond. Check API Key or Groq limits.");
    }

    // 4. Parse response manually for the array format usually returned by mixtral
    const aiContent = data.choices[0].message.content;
    let suggestedIds = [];
    try {
        const parsed = JSON.parse(aiContent);
        // Look for any array in the parsed object
        const key = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        suggestedIds = key ? parsed[k] : [];
    } catch (e) {
        // Fallback: search for ID patterns in string
        const regex = /[0-9a-fA-F]{24}/g;
        suggestedIds = aiContent.match(regex) || [];
    }

    res.json({ suggestedIds: suggestedIds.slice(0, 5) });

  } catch (error) {
    console.error("AI Suggestion Error", error);
    res.status(500).json({ error: 'AI failed to generate suggestions. Please try manual assignment.' });
  }
});

module.exports = router;
