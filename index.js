// Gift Ideas Search API
// To run: 1) Install Node.js, 2) Run: npm install express
// 3) Run: node server.js

const express = require('express');
const giftIdeas = require('./giftIdeasData.js');
const app = express();
const PORT = 3000;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.get('/',(req,res)=>{
  const htmllist=`
  <h1>Active EndPoints : </h1>
  <ul>
  <li>
  <div>
  <span>/api/gifts/search --->Giftia Gifts Api </span>
  <span>Ex: [domain]/api/gifts/search?interests=Technology%20%26%20Gadgets&occasions=Birthday&relations=Friend&budgets=1000%20-%202500</span>
  </div>
  </li>
  </ul>
  `
  res.send(htmllist)
})
// Single search endpoint - requires all 4 parameters
app.get('/api/gifts/search', (req, res) => {
  const { interests, occasions, relations, budgets } = req.query;
  
  // Validate that all 4 required parameters are present
  if (!interests || !occasions || !relations || !budgets) {
    return res.status(400).json({
      error: 'Missing required parameters',
      message: 'All 4 parameters are required: interests, occasions, relations, budgets',
      example: '/api/gifts/search?interests=Technology%20%26%20Gadgets&occasions=Birthday&relations=Friend&budgets=1000%20-%202500'
    });
  }
  
  // Helper function to check if gift matches filter
  const matchesFilter = (giftArray, searchValue) => {
    // Convert search value to array if it's a single value
    const searchValues = Array.isArray(searchValue) ? searchValue : [searchValue];
    
    // Check if any search value matches any gift filter value (case-insensitive)
    return searchValues.some(sv => 
      giftArray.some(gv => 
        gv.toLowerCase() === sv.toLowerCase()
      )
    );
  };
  
  // Convert simplified budget format (e.g., "1000 - 2500") to full format
  const formatBudget = (budget) => {
    // If it's already in full format with ₹, keep it
    if (budget.includes('₹')) return budget;
    
    // Convert "1000 - 2500" to "₹1000 – ₹2500"
    const parts = budget.split('-').map(p => p.trim());
    if (parts.length === 2) {
      return `₹${parts[0]} – ₹${parts[1]}`;
    }
    
    // Handle special cases
    if (budget.toLowerCase().includes('under')) {
      const amount = budget.match(/\d+/)?.[0];
      return `Under ₹${amount}`;
    }
    if (budget.toLowerCase().includes('above')) {
      const amount = budget.match(/\d+/)?.[0];
      return `Above ₹${amount}`;
    }
    
    return budget;
  };
  
  // Format budgets
  const budgetValues = Array.isArray(budgets) ? budgets : [budgets];
  const formattedBudgets = budgetValues.map(formatBudget);
  
  // Filter gifts based on all 4 parameters
  let results = giftIdeas.filter(gift => {
    const matchesInterests = matchesFilter(gift.matchFilters.interests, interests);
    const matchesOccasions = matchesFilter(gift.matchFilters.occasions, occasions);
    const matchesRelations = matchesFilter(gift.matchFilters.relations, relations);
    const matchesBudgets = matchesFilter(gift.matchFilters.budgets, formattedBudgets);
    
    // Gift must match ALL 4 filters
    return matchesInterests && matchesOccasions && matchesRelations && matchesBudgets;
  });
  
  // Return results as JSON array
  res.json({
    count: results.length,
    filters: {
      interests: Array.isArray(interests) ? interests : [interests],
      occasions: Array.isArray(occasions) ? occasions : [occasions],
      relations: Array.isArray(relations) ? relations : [relations],
      budgets: formattedBudgets
    },
    data: results
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Gift Ideas API running at http://localhost:${PORT}`);
  console.log('Required parameters in specified order: interests, occasions, relations, budgets\n');
});