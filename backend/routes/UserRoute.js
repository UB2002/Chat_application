const express = require('express');
const db = require('../db/config');
const { generateToken, hashPassword, comparePassword} = require("../auth/auth");

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await hashPassword(password);
  try {
    const result = await db.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    const user = result.rows[0];
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Username may already be taken.' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });
    const user = result.rows[0];
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid password' });
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/', async(req, res) => {
    try{
        const response = await db.query('SELECT * FROM users');
        res.json(response.rows);
    }
    catch(err){
        res.status(500).json({error: 'Server error'});
    }
})

module.exports = router;