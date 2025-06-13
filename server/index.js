const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('SmartCartAI backend is running');
});

// Import products from Fake Store API
app.post('/api/products/import', async (req, res) => {
  try {
    const response = await axios.get('https://fakestoreapi.com/products');
    const products = response.data;

    const insertQuery = `
      INSERT INTO products (name, description, price, image_url, category)
      VALUES (?, ?, ?, ?, ?)
    `;

    products.forEach(product => {
      db.query(insertQuery, [
        product.title,
        product.description,
        product.price,
        product.image,
        product.category
      ], (err) => {
        if (err) console.error('Insert error:', err.message);
      });
    });

    res.send('✅ Products imported from Fake Store API');
  } catch (error) {
    console.error('Import failed:', error.message);
    res.status(500).send('Failed to import products');
  }
});

// GET product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const query = 'SELECT * FROM products WHERE id = ?';
  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).send('Error retrieving product');
    }
    if (results.length === 0) {
      return res.status(404).send('Product not found');
    }
    res.json(results[0]);
  });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
