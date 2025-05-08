const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//inscription utilisateur
router.post('/register', async(req,res)=>{

    console.log('requete recu sur /api/auth/register');
    const {name, email, password, role} = req.body;

    if (!name || !email || !password || !role){
     return  res.status(400).json({error : "Tous les champs sont requis"});
    }
  

    try{
        const hashedPassword = await bcrypt.hash(password,10);

        const result = await db.query(
            'INSERT INTO users(name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING*',
            [name, email, hashedPassword, role ]
        );
        res.status(201).json({message: 'Utilisateur inscrit', user: result.rows[0]});
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Serveur error'});
    }

    

    

});


//connexion utilisateur
router.post('/login', async(req, res)=>{
  console.log('requete recu sur /api/auth/login');
  const {email, password} = req.body;

  try{
   const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

   if(result.rows.length ===0){
    return res.status(404).json({error: 'Utilisateur non trouve'});
   }
   
   const user =  result.rows[0];
   const isMatch = await bcrypt.compare(password, user.password);

   if(!isMatch){
    return res.status(404).json({error: 'Mot de passe incorrect'});
   }
   
   const token = jwt.sign(
    {id: user.id_users, 
      name: user.name, 
      email: user.email ,
      role: user.role
    }, 
    process.env.JWT_SECRET,
    {expiresIn: '1h'}
   );


   res.json({message: 'Connexion reussie', 
    token,
    user:
     {id: user.id_users, 
      name: user.name, 
      email: user.email ,
      role: user.role,
     }
   });

  } catch(err){
    console.error('Erreur de connexion:', err)
    res.status(500).json({error: err.message});

  }

});

module.exports = router;