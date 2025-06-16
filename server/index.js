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

// GET all products
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Error retrieving products');
    }
    res.json(results);
  });
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

/* ======== CART ROUTES ======== */

// For now, use a placeholder user ID since no auth yet
const PLACEHOLDER_USER_ID = 1;

// GET all cart items for user
app.get('/api/cart', (req, res) => {
  const query = `
    SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `;
  db.query(query, [PLACEHOLDER_USER_ID], (err, results) => {
    if (err) {
      console.error('Error fetching cart items:', err);
      return res.status(500).send('Error fetching cart items');
    }
    res.json(results);
  });
});

// Add a product to cart
app.post('/api/cart', (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || !quantity) {
    return res.status(400).send('product_id and quantity are required');
  }

  // Check if product already in cart for user
  const checkQuery = 'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?';
  db.query(checkQuery, [PLACEHOLDER_USER_ID, product_id], (err, results) => {
    if (err) {
      console.error('Error checking cart:', err);
      return res.status(500).send('Error adding to cart');
    }

    if (results.length > 0) {
      // Update quantity
      const newQuantity = results[0].quantity + quantity;
      const updateQuery = 'UPDATE cart_items SET quantity = ? WHERE id = ?';
      db.query(updateQuery, [newQuantity, results[0].id], (err) => {
        if (err) {
          console.error('Error updating quantity:', err);
          return res.status(500).send('Error updating cart');
        }
        res.send('Cart updated');
      });
    } else {
      // Insert new item
      const insertQuery = 'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)';
      db.query(insertQuery, [PLACEHOLDER_USER_ID, product_id, quantity], (err) => {
        if (err) {
          console.error('Error inserting cart item:', err);
          return res.status(500).send('Error adding to cart');
        }
        res.send('Added to cart');
      });
    }
  });
});

// Update quantity of a cart item
app.put('/api/cart/:id', (req, res) => {
  const cartItemId = req.params.id;
  const { quantity } = req.body;
  if (quantity === undefined) {
    return res.status(400).send('quantity is required');
  }

  const updateQuery = 'UPDATE cart_items SET quantity = ? WHERE id = ?';
  db.query(updateQuery, [quantity, cartItemId], (err) => {
    if (err) {
      console.error('Error updating cart item:', err);
      return res.status(500).send('Error updating cart item');
    }
    res.send('Cart item updated');
  });
});

// Remove a cart item
app.delete('/api/cart/:id', (req, res) => {
  const cartItemId = req.params.id;

  const deleteQuery = 'DELETE FROM cart_items WHERE id = ?';
  db.query(deleteQuery, [cartItemId], (err) => {
    if (err) {
      console.error('Error deleting cart item:', err);
      return res.status(500).send('Error deleting cart item');
    }
    res.send('Cart item removed');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
