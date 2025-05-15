const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authe')

// GET /users - Recuperer tous les utilisateurs dans la BDD
//profil de la personne
router.get('/profile', authMiddleware, async(req, res)=>{
    console.log('requete recu sur api/users/profile')
    try{
        const userId = req.user.id;
        const result = await db.query('SELECT id_users AS id, name, email, role FROM users WHERE id_users= $1', [userId]);
        res.json({user: result.rows[0]});
    } catch(err) {
        console.log('Erreur lors de la recuperation des utilisateurs', err);
        res.status(500).json({error: 'Erreur serveur'});
    }
});

//route pour recuperer les utilisateurs par role GET api/user?role=freelance ou client
router.get('/', async(req, res)=>{
    console.log('Requete recu sur GET api/user?role=...');

    const userRoleFilter = req.query.role; //recuperation de param de requete role

    let query = 'SELECT id_users, name, email, role FROM users';
    const queryParams = []; //pour mettre les parametres de requete SQL

    //specification des roles avec la clause WHERE
    if(userRoleFilter){
        query += ' WHERE role = $1';
        queryParams.push(userRoleFilter); //ajout la valeur du role comme param securisee
        console.log(`Filtrage par role: ${userRoleFilter}`);
    }
     
    console.log('Requete SQL finale construite: ', query);
    console.log('Parametre de la requete SQL: ', queryParams);

    //execution requete
    try{
        const result = await db.query(query, queryParams);
        
        res.json(result.rows); //renvoyer la liste des utilisateurs trouve filtre ou non

    }catch(err) {
        console.error('Erreur lors de la recuperation des utilisateurs:', err);
        res.status(500).json({error: 'Erreur du serveur lors de la recuperation des utilisateurs'});

    }


});


//Modifier un utilisateur PUT par id
router.put('/:id', async(req, res)=>{
    const {id} = req.params;
    const {name, email}= req.body;

    try{
        const result = await db.query(
            'UPDATE users SET name =$1, email = $2 WHERE id_users = $3 RETURNING id_users, name, email',
            [name, email, id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({error: 'Utilisateur introuvable'});
        }

    }catch(err){
        console.error('Erreur modification:', err)
        res.status(500).json({error: 'Erreur serveur'});

    }

});

//Supprimer un utilisateur
router.delete('/:id', async(req,res) =>{
    const {id} = req.params;
    try{
        const result = await db.query(
            'DELETE FROM users WHERE id_users = $1 RETURNING*', 
            [id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({error: 'Utilisateur non trouve'})
        }
        res.json({message: 'utilisateur supprime'});

    }catch(err){
        console.error('erreur suppression', err)
        res.status(500).json({error: 'erreur serveur'})
    }
});

//----------------ROUTE POUR OBTENIR LES COMPETENCES D'UN UTILISATEUR CONNECTE-------------------//
router.get('/profile/skills', authMiddleware, async(req,res)=>{
    console.log('Requete recue sur GET /api/profile/skills');

    const userId = req.user? req.user.id : req.user.Id;

  if(!userId){
    console.warn('>>> /api/profile/skills: ID utilisateur non disponible apres authentification.');
    return res.status(401).json({error: 'Utilisateur non authentifie'});
  }

  try{
    const searchQuery = `
    SELECT s.id_skills, s.name
    FROM users_skills AS us
    JOIN skills AS s ON us.skill_id = s.id_skills
    WHERE us.user_id = $1
    ORDER BY s.name ASC;`;

    console.log(`>>> /api/profile/skills: Recherche des competences pour l'utilisateur ID : ${userId}`);

    const result = await db.query(searchQuery, [userId]);
    console.log(`>>> /api/profile/skills: Trouve ${result.rows.length} competence pour l'utilisateur 
        ${userId} `);
    res.json({skills: result.rows}); //renvoi un json avec une cle skills

  }catch(err){
    console.error('>>> /api/profile/skills: Erreur lors de la recuperation des competences de l\'utilisateur:',err);
    res.status(500).json({error: 'Erreur serveur lors de la recupération des compétences'});

  }

});

//--- ----ROUTE POUR AJOUTER UNE COMPÉTENCE AU PROFIL DE L'UTILISATEUR CONNECTÉ ------//
router.post('/profile/skills', authMiddleware, async(req,res)=>{
    console.log('Requete recue sur POST /api/profile/skills');

    const userId = req.user? req.user.id : req.user.Id;
    const {skillId} = req.body; //recupere depuis la requete

    if(!userId || skillId === undefined ){ //verification de la presence
        console.warn(' >>> POST /api/profile/skills: userId ou skillId manquant dans la requete');
        res.status().json({message: 'ID utilisateur ou ID competence manquant dans le corps de la requete.'});

    }

    if(typeof skillId !=='number' || !Number.isInteger(skillId) ){
        console.warn('>>> POST /api/profile/skills: skillId n\'est pas un entier valide');
        return res.status(400).json({message: 'Format de l\'ID competence invalide'});

    }

    try{
        // 1. Verifier si la competence (skillId) existe reellement dans la table 'skills'
        const skillExists = await db.query('SELECT 1 FROM users_skills WHERE user_id = $1 AND skill_id = $2',
            [skillId]
        );

        if(skillExists.rows.length ===0){
            console.warn('>>> POST /api/profile/skills: Competence avec ID ${skillId} non trouvee dans la table skills.');
            return res.status(404).json({message: 'Competence specifique non trouvee'});
        }

        // 2.verifier si l'utilisateur n'a pas deja cette competences
        const existingSkill = await db.query('SELECT 1 FROM users_skills WHERE user_id = $1 AND skill_id = $2',
            [userId, skillId]
        );
        
        if(existingSkill.rows.length >0 ){
            console.log(`>>> POST /api/profile/skills: Utilisateur ${userId} a deja la 
                competence ${skillId}` );
        return res.status(409).json({message: 'L\'utilisateur possede deja cette competence'});
        }

        //MAINTENANT SI TOUT EST OK INSERTION DANS LA BDD
        // Insere une nouvelle ligne liant l'utilisateur et la competence
        const result = await db.query(`
            INSERT INTO users_skills (user_id, skill_id) VALUES ($1, $2) RETURNING *`,
            [userId, skillId]);
        
        console.log(`>>> POST /api/profile/skills: Competence ${skillId} ajoutee de l'utilisateur
            ${userId} `);
        res.status(201).json({message: 'Competence ajoutee avec succes ', 
            userSkill: result.rows[0] });


    }catch(err){
        console.error('>>>POST /api/profile/skills: Erreur lors de l\'ajout de la competence:', err);
        res.status(500).json({error: 'Erreur serveur lors de l\'ajout de la competence.'});
    }

} );




module.exports = router;