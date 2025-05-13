const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'kasir_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product sizes by product id
app.get('/api/products/:id/sizes', async (req, res) => {
  const productId = req.params.id;
  try {
    const [rows] = await pool.query('SELECT * FROM product_sizes WHERE product_id = ?', [productId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new product
app.post('/api/products', async (req, res) => {
  const { name, barcode, price, category, image, sizes, variants } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO products (name, barcode, price, category, image) VALUES (?, ?, ?, ?, ?)',
      [name, barcode, price, category, image]
    );
    const productId = result.insertId;

    if (sizes && sizes.length > 0) {
      for (const size of sizes) {
        await conn.query(
          'INSERT INTO product_sizes (product_id, size, barcode, stock) VALUES (?, ?, ?, ?)',
          [productId, size.size, size.barcode, size.stock]
        );
      }
    }

    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await conn.query(
          'INSERT INTO product_variants (product_id, variant_name) VALUES (?, ?)',
          [productId, variant]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ message: 'Product added', productId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  const { name, barcode, price, category, image, sizes, variants } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE products SET name = ?, barcode = ?, price = ?, category = ?, image = ? WHERE id = ?',
      [name, barcode, price, category, image, productId]
    );

    // Delete old sizes and variants
    await conn.query('DELETE FROM product_sizes WHERE product_id = ?', [productId]);
    await conn.query('DELETE FROM product_variants WHERE product_id = ?', [productId]);

    // Insert new sizes
    if (sizes && sizes.length > 0) {
      for (const size of sizes) {
        await conn.query(
          'INSERT INTO product_sizes (product_id, size, barcode, stock) VALUES (?, ?, ?, ?)',
          [productId, size.size, size.barcode, size.stock]
        );
      }
    }

    // Insert new variants
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await conn.query(
          'INSERT INTO product_variants (product_id, variant_name) VALUES (?, ?)',
          [productId, variant]
        );
      }
    }

    await conn.commit();
    res.json({ message: 'Product updated' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [productId]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add sale transaction
app.post('/api/sales', async (req, res) => {
  const { customer_id, receipt_number, sale_date, discount, add_on, add_on_description, tax, total, payment_method, items } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO sales (customer_id, receipt_number, sale_date, discount, add_on, add_on_description, tax, total, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [customer_id, receipt_number, sale_date, discount, add_on, add_on_description, tax, total, payment_method]
    );
    const saleId = result.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO sale_items (sale_id, product_id, size, variant, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [saleId, item.product_id, item.size, item.variant, item.quantity, item.price, item.total]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Sale recorded', saleId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Start server
app.listen(port, () => {
  console.log(`Kasir backend server running at http://localhost:${port}`);
});
