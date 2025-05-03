const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /users - Récupérer tous les utilisateurs dans la BDD

router.get('/', async(req, res)=>{
    try{
        const result = await db.query('SELECT id_users, name, email FROM users');
        res.json(result.rows);
    } catch(err) {
        console.log('Erreur lors de la recuperation des utilisateurs', err);
        res.status(500).json({error: 'Erreur serveur'});
    }
});

// GET /users/:id - Recuperer un utilisateur par son ID
router.get('/:id', async(req, res) =>{
    const {id} = req.params;
    try{
        const result = await db.query('SELECT id_users, name, email FROM users WHERE id_users = $1, [id]');
        if(result.rows.length ===0){
            return res.status(404).json({error: 'Utilisateur non trouve'});
        }
        res.json(result.rows[0]); //envoi en json
    }
    catch (err){
        console.error('Error: ', err);
        res.status(500).json({error : 'Erreur serveur'});
    }
});

//ROUTE POST  creation nouvel utilisateur
router.post('/', async(req, res)=>{
  const {name, email, password, role} = req.body //extraction des donnees envoye dans le corps de la requete

  if (!name || !email || !password || !role){
    res.status(400).json({error : "Tous les champs sont requis"});
  }

  try{
  const result = await db.query(
   'INSERT INTO users (name, email, password, role ) VALUES ($1,  $2, $3, $4) RETURNING *',
   [name, email, password, role]
  );
  res.status(201).json(result.rows[0]); // Renvoi l'user cree avec son id

  } catch(err) {
    console.error(err);
    res.status(500).json({error: ' Erreur serveur'});

  }

});

module.exports = router;