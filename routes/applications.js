const express = require('express');
const router = express.Router();
const db = require('../db');

//postuler a une mission 
router.post('/', async(req,res)=>{
 const { freelance_id, mission_id} = req.body;

 if(!freelance_id || !mission_id){
    return res.status(400).json({error: 'Les champs freelance et missions sont requis'});
 }

 try{
  const result = await db.query(
    'INSERT INTO applications( freelance_id, mission_id)  VALUES($1, $2 ) RETURNING*',
 [freelance_id, mission_id]
);
 res.status(201).json(result.rows[0]); //renvoi

 } catch(err){
    console.error(err);
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