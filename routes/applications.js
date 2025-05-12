const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authe')

//--------------------Un freelance postule a une mission  avec un message authentifie--------------------//
router.post('/apply', authMiddleware ,async(req,res)=>{
  console.log('Requete recu sur POST api/applications/apply');

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

//--------------------voir toutes les candidatures filtre-------------------------//
router.get('/view-applied', authMiddleware, async(req, res) =>{
  console.log('Requete recu sur GET /api/applications');

  const userId = req.user.id;
  const userRole = req.user.role; //role de l'user conncete

    try{
      //role freelance
      if(userRole === 'freelance'){
        // Joindre applications et missions pour obtenir les titres
       // Filtrer par l'ID du freelancer connecté

     const result = await db.query(
    `SELECT 
     a.id_applications,
     a.mission_id,
     a.message_content, 
     a.status AS application_status, -- Statut de la candidature
     a.applied_at AS application_date, -- Date de candidature
     m.title AS mission_title, -- Titre de la mission
     m.description AS mission_description, 
     m.status AS mission_status --status de la mission
     FROM applications AS a

     JOIN missions AS m ON a.mission_id = m.id_missions -- Jointure pour lier candidature et mission
     WHERE a.freelance_id = $1 --Filtrer par l'ID du freelancer connecté
     ORDER BY a.applied_at DESC --Filtre par date de candidature
     `,
     [userId]
    );
    res.json(result.rowa); //Renvoyer la liste des candidatures du freelancer

   }
   // Si l'utilisateur est un client
    else if (userRole === 'client'){
      // Si l'utilisateur est un client, il voudra voir les candidatures soumises à SES missions.
      const result = await db.query(
        `SELECT
         a.id_applications,
         a.freelance_id,
         a.message_content,
         a.status AS application_status,
         a.applied_at AS application_date,
         m.title AS  mission_title,
         m.description AS mission_description,
         m.status AS mission_status,
         u.name AS freelancer_name 
        FROM applications AS a
        JOIN missions AS m ON a.mission_id = m.id_missions
        LEFT JOIN users AS u ON a.freelance_id = u.id_users ---- Joindre users pour le nom du freelancer
        WHERE m.client_id = $1 ---Filtre ID  client
        ORDER BY a.applied_at DESC; `,
        [userId]
      );
      res.json(result.rows); //

    }

    else{
      res.status(403).json({error: 'Rôle non autorisé à voir les candidatures'})
    }

    }catch(err){
     console.error('Erreur lors de la récupération des candidatures:', err);
     res.status(500).json({error: err.message});
    }
});

//-----------DASHBOARD GET nombre de candidature soumise par un freelancer connecté-----------------//
//Compte le nombre total de candidatures soumises par le freelancer connecté

router.get('/count/by-freelancer', authMiddleware, async(req, res)=>{
 
  console.log('Requete recue sur GET /api/applications/count/by-freelancer');

  if(req.user.role !== 'freelance'){
    return res.status(403).json({error: 'Vous devez etre freelancer'});
  }

  const freelanceId = req.user.id;

  try{
     const result = await db.query('SELECT COUNT (*) FROM applications WHERE freelance_id = $1 ', [freelanceId]);
     const appliedCount = parseInt(result.rows[0].count, 15);
     res.json({count: appliedCount});

  } catch (err) {
    console.error('Erreur lors du comptage des candidatures par freelancer', err);
    res.status(500).json({error: 'Erreur serveur lors du comptage des candidatures.' });

  }

});

//----------------DASHBOARD  liste des candidatures qu'un freelance a postule---------------------------//
router.get('/by-freelancer', authMiddleware, async (req, res)=>{
  console.log('Requête reçue sur GET /api/applications/by-freelancer');

  try{
    // L'ID du freelancer est disponible via req.user.id grâce à authMiddleware
    const freelanceId = req.user.id;

    // Sélectionne les champs pertinents des deux tables
    const result = await db.query(
      `SELECT
       app.id_applications,
       app.mission_id,
       app.message_content,
       app.status AS  application_status,
       app.applied_at AS application_date,
       m.title AS mission_title,
       m.status AS mission_status,
       m.client_id 
      FROM applications AS app
      JOIN missions AS m ON app.mission_id = m.id_missions 
      WHERE app.freelance_id = $1
      ORDER BY app.applied_at DESC;
      `,
      [freelanceId]
    );

    console.log(`Found ${result.rows.length} application for freelance  ID ${freelanceId}`);
    res.json(result.rows);

   }catch(err){
    console.error('Erreur lors de la récupération des candidatures du freelancer:', err);
    res.status(500).json({error: 'Erreur serveur lors de la récupération des candid candidatures' });

  }

});

//------------  DASHBOARD Liste des candidature qu'un client voit dans son dash-----------------------//
// GET /api/applications/by-client

router.get('/by-client', authMiddleware,  async(req, res)=>{
  console.log('Requête reçue sur GET /api/applications/by-client');

  const clientId = req.user.id;

  if(req.user.role !== 'client'){
    console.warn(`User ${req.user.id} with role ${req.user.role} attempted to access client applications. `);
    return res.status(403).json({error: 
      'Accès refusé. Seuls les clients peuvent voir les candidatures pour leurs missions'});
  }

  //requete

  try{
    const result = await db.query(
      `SELECT
       app.id_applications,
       app.message_content,
       app.status AS application_status,
       app.applied_at AS application_date,
       m.id_missions,
       m.title AS mission_title,
       m.status AS mission_status,
       m.client_id,
       u.id_users AS freelancer_id,
       u.name AS freelancer_name,
      FROM applications AS app
      JOIN missions AS m ON app.mission_id = m.id_missions -- Relie candidature à sa mission
      JOIN users AS u ON  app.freelance_id = u.id_users, -- Relie candidature au freelancer
      WHERE m.client_id = $1 -- Filtre les candidatures dont la mission appartient au client connecté
      ORDER BY app.applied_at DESC;`,
      [clientId]
    );

    console.log(`Found ${result.rows.length} application for client ID ${clientId}'s missions `);
    res.json(result.rows);

  }catch(err){
    console.error('Erreur lors de la récupération des candidatures pour le client:', err);
    res.status(500).json({error: 'Erreur serveur lors de la récupération des candidatures'});

  }









} )


module.exports = router;