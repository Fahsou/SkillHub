const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async(req, res)=>{
    const{name } = req.body;

    if(!name){
        return res.status(400).json({error: 'Le champ est requis'});
    }

    try{
     const result = await db.query(
        'INSERT INTO skills (name) VALUES ($1) RETURNING*',
        [name]
     );
     res.status(201).json(result.rows[0]); // envoi result
    }catch(err){
   console.error(err)
   res.status(500).json({error: 'Erreur serveur'});

    }
});