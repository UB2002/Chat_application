const db = require("../db/config");
const express = require('express');

const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const { rows } = await db.query('SELECT u.id, u.username FROM contacts c JOIN users u ON c.contact_id = u.id WHERE c.user_id = $1', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error('Get contacts error:', err);
        res.status(500).json({ error: 'Server error while fetching contacts' });
    }
});

// Changed from /add to / to be more RESTful (POST /api/contacts)
router.post('/', async(req, res) => {
    const { username } = req.body;
    try{
        const {rows: contact} = await db.query('SELECT id FROM users WHERE username = $1', [username]);
        if (contact.length === 0) return res.status(400).json({error: 'User not found'});
        await db.query('INSERT INTO contacts (user_id, contact_id) VALUES ($1, $2)',[req.user.id, contact[0].id]);
        res.status(201).json({message: 'Contact added'});
    }
    catch(err){
        console.error('Add contact error:', err);
        // Handle potential unique constraint violation (contact already exists)
        if (err.code === '23505') { // unique_violation
            return res.status(409).json({ error: 'Contact already exists' });
        }
        res.status(500).json({ error: 'Server error while adding contact' });
    }
});

module.exports = router;