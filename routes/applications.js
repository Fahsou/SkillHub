const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authe')

//Un freelance postule a une mission  avec un message
router.post('/', authMiddleware ,async(req,res)=>{
  console.log('Requete recu sur POST api/application');

 const {mission_id, message_content} = req.body;
 const freelance_id = req.user.id;


 if(!mission_id || message_content === undefined || message_content === null){
    return res.status(400).json({error: 'Mission ID et contenu du message requis requis'});
 }

 if(req.user.role !== 'freelance'){
  return res.status(403).json({error:"Seul les utilisateurs avec role freelance peuvent postuler"});
 }

 try{
 const existingApplication = await db.query(
  'SELECT id_applications FROM applications WHERE freelance_id = $1 AND  mission_id = $2',
  [freelance_id, mission_id]
 );

 if(existingApplication.rows.length>0){
  return res.status(409).json({error: 'Vous avez deja postule a cette mission'});
 }


  //insertion dans la table application
  const result = await db.query(
    'INSERT INTO applications( freelance_id, mission_id, message_content)  VALUES($1, $2, $3 ) RETURNING*',
 [freelance_id, mission_id, message_content]
);
 console.log('Candidature enregistre:', result.rows[0]);
 res.status(201).json(result.rows[0]); //renvoi

 } catch(err){
    console.error('Erreur lors de la creation de la candidature:', err);
   res.status(500).json({error: err.message});
 }
});

//voir toutes les candidatures
router.get('/', async(req, res) =>{
    try{
  const result = await db.query(
    `SELECT a.id_applications`
  )

    }catch(err){

    }
})

module.exports = router;