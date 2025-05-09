const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authe');

//--------------------------ajouter une mission---------------------------------//
router.post('/createMission', authMiddleware, async(req, res)=>{
  console.log('requete recu sur api/missions/createMission');

  const {title, description} = req.body; // extraction des donnees
  const client_id = req.user.id;

  if( !title || !description || !client_id){
    return res.status(400).json({error: 'Tous les champs sont requis'});
  }

  try{
    const result = await db.query('INSERT INTO missions (title, description, client_id) VALUES($1, $2,$3) RETURNING* ',
        [title, description, client_id]
    );
    console.log('Mission cree en BDD', result.rows[0]);
    res.status(201).json(result.rows[0]);

  }catch(err){
    console.error('Erreur lors de la creation de mission', err);
   res.status(500).json({error: err.message});
  }
});

//------------------------recuperer toutes les missions-------------------------------//
router.get('/showMissions', async(req, res)=>{
    try{
        const result = await db.query('SELECT* FROM missions');
        res.json(result.rows);
    }catch(err){
        res.status(500).json({error: err.message});
    }
})

//-------------------recuperation de mission par id pour postuler a une mission specifique--------------------//
router.get('/:id', async(req,res)=>{
  console.log('Requete recue sur GET /api/missions/:id');

  const missionId = req.params.id; //recupere id mission depuis parametre URL
  try{
    const result = await db.query('SELECT* FROM missions WHERE id_missions = $1', [missionId]);

    if(result.rows.length === 0 ){
      return res.status(404).json({error: 'Mission non trouvee'});
    }

    res.json(result.rows[0]); //renvoyer le resultat

  } catch(err) {
    console.error('Erreur lors de la recuperation de la mission par ID: ', err);
    res.status(500).json({ error: 'Erreur serveur lors de la recuperation ID'});

  }

} )

module.exports = router;