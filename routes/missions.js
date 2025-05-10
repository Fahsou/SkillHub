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
});

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

} );

//--------------------DASHBOARD GET /api/missions/count/published-by-client--------------------//
//Compte le nombre total de mission publie par un client connecte
router.get('/count/published-by-client', authMiddleware, async(req,res)=>{
  console.log('Requete recue sur GET /api/missions/count/published-by-client');
  
  if(req.user.role !== 'client' ){
    return res.status(403).json({error: 'Acces refuse seul les clients peuvent voir'});
  }
  
  const clientId = req.user.id;

  try{
    const result = await db.query('SELECT COUNT(*) FROM missions WHERE client_id = $1', [clientId] );
    const publishedCount = parseInt(result.rows[0].count, 10);
    res.json({count: publishedCount});

  } catch(err){
    console.error('Erreur lors du comptage des missions publiées par client:', err);
    res.status(500).json({ error: 'Erreur serveur lors du comptage des missions.' });

  }

});

// ------------ROUTE DASHBOARD: GET /api/missions/with-application-counts-by-client ------------------------//
// Liste les missions d'un client avec le nombre de candidatures pour chaque mission
// Nécessite la table 'applications' existante
router.get('/mission-has-application', authMiddleware, async(req,res)=>{
  console.log('Requete recue sur GET /api/missions/mission-has-application');
  if(req.user.role !== 'client' ){
    return res.status(403).json({error: 'Acces refuse seul les clients peuvent voir'});
  }

  const clientId = req.user.id;

  try{
        const query = 
        `SELECT
         m.id_missions,
         m.title,
         m.description,
         m.created_at,
         m.status,  
         COUNT(a.id_applications) AS application_count
         FROM missions AS m
         LEFT JOIN applications AS a ON m.id_missions = a.mission_id
         WHERE m.client_id = $1
          -- Grouper par toutes les colonnes non agrégées
         GROUP BY m.id_missions, m.title, m.description, m.created_at, m.status
         ORDER BY  m.created_at DESC;
         `;

         const result = await db.query(query, [clientId]);
         res.json(result.rows);


  }catch(err){ 
    console.error('Erreur lors de la récupération des missions avec compte candidatures par client:', err);
    res.status().json({ error: 'Erreur serveur lors de la récupération des données.' });


  }
  });

module.exports = router;