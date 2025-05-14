const express = require('express');
const router = express.Router();
const db = '../db';

// ----------------- ROUTE DE RECHERCHE DE MISSIONS (GET /api/search/missions) ----------------//
//Base sur les mots cles
router.get('/missions', async(req, res)=>{
 console.log('Requete recu sur GET /api/search/missions ');

 const keyword = req.query.keyword;

 if(!keyword){
    console.log('>>> /api/search/missions: Aucun mot-cle fourni.');

   return res.status(400).json({message: 'Veuillez fournir un mot-cle pour la recherche'});
   // return res.json([]);
}

// --- REQUÊTE SQL POUR RECHERCHER DES MISSIONS --- 
//insenible a la casse
try{
    const searchQuery =
  `SELECT *
   FROM missions 
   WHERE title ILIKE $1 OR description ILIKE $1
   ORDER BY created_at DESC;
  `;

  const keywordParam = `%${keyword}%`;

  console.log(`>>> /api/search/missions: Recherche pour le mot-cle "${keyword}"`);

  const result = await db.query(searchQuery, [keywordParam]); //dans la bdd
  console.log(`>>> /api/search/missions: Trouve ${result.rows.length} missions.`);

  res.json(result.rows); //Renvoyer la mission trouve

}catch(err){
    console.error('>>> /api/search/missions: Erreur lors de la recherche de missions:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la recherche de missions.' });
}

} );

// --- ROUTE DE RECHERCHE DE FREELANCERS (GET /api/search/freelancers) ------//
//base sur un mot cle
router.get('/freelancers', async(req, res)=>{
    console.log('Requete recue sur GET /api/search/freelancers');

    const keyword = req.query.keyword;

    if(!keyword){
      return  res.status(400).json({ message: 'Veuillez fournir un mot-cle pour la recherche' });
        //return res.json([]);
    }

    //-----REQUETE SQL--------//
    // Nous allons joindre les tables users, users_skills, et skills
    try{
   const searchQuery=
      `SELECT DISTINCT u.id_users, u.name, u.email, u.role
       FROM users AS u
       JOIN users_skills AS us ON u.id_users = us.user_id
       JOIN skills AS s ON us.skill_id = s.id_skills
       WHERE u.role = 'freelance'
       AND (
            -- Recherche le mot-cle dans le nom de l'utilisateur
            u.name ILIKE $1
            -- recherche le mot-cle dans le nom de la competence associee
            OR s.name ILIKE $1
         )
        ORDER BY u.name ASC;
        `;
    const keywordParam = `&${keyword}%`; //permet la recherche partout

    console.log(`>>> /api/search/freelancers: Recherche pour le mot-cle "${keyword}" dans nom et competences.`);
    console.log(`>>> /api/search/freelancers: Requete SQL:`, searchQuery); 
    console.log(`>>> /api/search/freelancers: Parametre:`, [keywordParam]); 

    // --- EXÉCUTER LA REQUÊTE ---

    const result = await db.query(searchQuery, [keywordParam] );
            console.log(`>>> /api/search/freelancers: Trouve ${result.rows.length} freelancers.`);
            res.json(result.rows);

  }catch(err){
    console.error('>>> /api/search/freelancers: Erreur lors de la recherche de freelancers (par mot-cle et competences):', err);
     res.status(500).json({ error: 'Erreur serveur lors de la recherche de freelancers.' });
 }


} );

module.exports = router;
