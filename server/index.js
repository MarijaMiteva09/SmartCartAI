const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware for verifying JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};

// Register
app.post('/api/register', (req, res) => {
  const { full_name, email, password } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('DB error on select:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    try {
      const hashed = await bcrypt.hash(password, 10);
      db.query(
        'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
        [full_name, email, hashed],
        (err) => {
          if (err) {
            console.error('DB error on insert:', err);
            return res.status(500).json({ message: 'Failed to register user' });
          }
          res.status(201).json({ message: 'User registered successfully' });
        }
      );
    } catch (error) {
      console.error('Hashing error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      console.warn('❌ No user found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    // 🔍 DEBUG: Log incoming password and stored hash
    console.log('🔐 Attempting login...');
    console.log('👉 Email:', email);
    console.log('👉 Password entered:', password);
    console.log('👉 Hashed password in DB:', user.password_hash);

    const match = await bcrypt.compare(password, user.password_hash);

    // 🔍 DEBUG: Log result of bcrypt comparison
    console.log('✅ Password match result:', match);

    if (!match) {
      console.warn('❌ Password did not match for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email },
    });
  });
});

// === PRODUCTS ===
// Import Fake Store products
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

    res.send('✅ Products imported');
  } catch (error) {
    console.error('Import failed:', error.message);
    res.status(500).send('Failed to import products');
  }
});

// Search and filter products
app.get('/api/products/search', (req, res) => {
  const { query, category, minPrice, maxPrice } = req.query;

  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  
  if (query) {
  sql += ' AND (name LIKE ? OR description LIKE ?)';
  params.push(`%${query}%`, `%${query}%`);
   }

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (minPrice) {
    sql += ' AND price >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    sql += ' AND price <= ?';
    params.push(maxPrice);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Search query error:', err);
      return res.status(500).send('Error fetching products');
    }
    res.json(results);
  });
});

app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).send('Error fetching products');
    res.json(results);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send('Error fetching product');
    if (results.length === 0) return res.status(404).send('Not found');
    res.json(results[0]);
  });
});

// === CART (requires authentication) ===
app.get('/api/cart', authenticate, (req, res) => {
  db.query(`
    SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).send('Error fetching cart');
      res.json(results);
    });
});

// POST /api/cart - add or update cart item
app.post('/api/cart', authenticate, (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || !quantity) return res.status(400).send('Required fields missing');

  db.query(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
    [req.user.id, product_id],
    (err, results) => {
      if (err) return res.status(500).send('Error');

      if (results.length > 0) {
        const newQty = results[0].quantity + quantity;
        db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, results[0].id], err =>
          err ? res.status(500).send('Update failed') : res.send('Cart updated')
        );
      } else {
        db.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [req.user.id, product_id, quantity],
          err => err ? res.status(500).send('Insert failed') : res.send('Added to cart')
        );
      }
    });
});

app.put('/api/cart/:id', authenticate, (req, res) => {
  const { quantity } = req.body;
  db.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, req.params.id, req.user.id],
    err => err ? res.status(500).send('Update failed') : res.send('Cart item updated'));
});

app.delete('/api/cart/:id', authenticate, (req, res) => {
  db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id],
    err => err ? res.status(500).send('Delete failed') : res.send('Cart item deleted'));
});

// === CHECKOUT (authenticated) ===
app.post('/api/checkout', authenticate, (req, res) => {
  const { fullName, address, email, cardNumber, cartItems } = req.body;

  if (!fullName || !address || !email || !cardNumber || !cartItems?.length) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const insertOrderQuery = `
    INSERT INTO orders (user_id, full_name, address, email, card_number, total_price)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(insertOrderQuery, [req.user.id, fullName, address, email, cardNumber, totalPrice], (err, result) => {
    if (err) return res.status(500).send('Order insert error');

    const orderId = result.insertId;
    const insertItemQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `;

    cartItems.forEach(item => {
      db.query(insertItemQuery, [orderId, item.id, item.quantity, item.price], (err) => {
        if (err) console.error('Item insert error:', err);
      });
    });

    res.status(201).json({ message: '✅ Order placed' });
  });
});

// === ORDER HISTORY ===
app.get('/api/orders/history', authenticate, (req, res) => {
  const query = `
    SELECT o.id AS order_id, o.total_price, o.created_at,
           oi.product_id, p.name, oi.quantity, oi.price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(query, [req.user.id], (err, results) => {
    if (err) return res.status(500).send('Failed to fetch history');
    res.json(results);
  });
});

// === CHATBOT ===
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo', // Or try: 'mistralai/mixtral-8x7b'
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Chatbot failed to respond' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
