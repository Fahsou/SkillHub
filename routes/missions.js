const express = require('express');
const router = express.Router();
const db = require('../db');

//ajout mission
router.post('/', async(req, res)=>{
  const {title, description, client_id} = req.body; // extraction des donnees

  if( !title || !description || !client_id){
    return res.status(400).json({error: 'Tous les champs sont requis'});
  }

  try{
    const result = await db.query('INSERT INTO missions (title, description, client_id) VALUES($1, $2,$3) RETURNING* ',
        [title, description, client_id]
    );
    res.status(201).json(result.rows[0]);

  }catch(err){
   res.status(500).json({error: err.message});
  }
});

//recuperer tous
router.get('/', async(req, res)=>{
    try{
        const result = await db.query('SELECT* FROM missions');
        res.json(result.rows);
    }catch(err){
        res.status(500).json({error: err.message});
    }
})

module.exports = router;