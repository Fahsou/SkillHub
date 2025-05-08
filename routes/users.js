const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authe')

// GET /users - Recuperer tous les utilisateurs dans la BDD

router.get('/profile', authMiddleware, async(req, res)=>{
    try{
        const userId = req.user.id;
        const result = await db.query('SELECT id_users, name, email, role FROM users WHERE id_users=$1', [userId]);
        res.json(result.rows[0]);
    } catch(err) {
        console.log('Erreur lors de la recuperation des utilisateurs', err);
        res.status(500).json({error: 'Erreur serveur'});
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