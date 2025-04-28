const express = require('express');
const router = express.Router();
const db = require('./db');

// GET /users - Récupérer tous les utilisateurs

router.get('/', async(req, res)=>{
    try{
        const result = await db.query('SELECT id_users, name, email FROM users');
        res.json(result.rows);
    } catch(err) {
        console.log('Erreur lors de la recuperation des utilisateurs', err);
        res.status(500).json({error: 'Erreur serveur'});
    }
});

// GET /users/:id - Récupérer un utilisateur par son ID
