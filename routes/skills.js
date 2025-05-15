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

//-------------Route pour obtenir les competences-----------------------//

router.get('/', async(req,res)=>{
    console.log('Requete recue sur GET /api/skills');

  try{
    const result = await db.query('SELECT id_skills, name, description FROM skills ORDER BY name ASC');

    console.log(`/api/skills: Trouve ${result.rows.length} competences`);
    res.json(result.rows); // Renvoyer le tableau de toutes les competences

  }catch(err){
    console.error('>>> /api/skills: Erreur lors de la récupération des competences: ', err);
    res.status(500).json({error: 'Erreur serveur lors de la recuperation des competences'});
  }

});

module.exports = router;