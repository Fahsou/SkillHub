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


module.exports = router;