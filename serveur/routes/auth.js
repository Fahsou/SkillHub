const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const User = require('../models/Users'); // <<< Assurez-vous que le chemin est correct
const jwtSecret = process.env.JWT_SECRET || '@secret_super';


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
    jwtSecret,
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

// --- LA ROUTE GET /api/auth/me (utilise db.query) ------------//
router.get('/me', async(req,res)=>{
  console.log('requete recu sur /api/auth/me'); 

  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('>>> /api/auth/me: Aucun token dans l\'en-tete.'); // Log si pas de token
    return res.status(401).json({ message: 'Aucun token, autorisation refusee.' });
}

 try{
  // 1. Verifier le token
  const decoded = jwt.verify(token, jwtSecret);

  console.log('>>> /api/auth/me: Token decode:', decoded); // Log du payload
  const userId = decoded.id;

  if (!userId) {
    console.error(">>> /api/auth/me: Payload JWT ne contient pas l'ID utilisateur attendu.", decoded);
    return res.status(401).json({ message: 'Token invalide : ID utilisateur manquant dans le payload.' });
}

console.log(`>>> /api/auth/me: Recherche utilisateur avec l'ID : ${userId} en base de donnees.`);
 const result = await db.query('SELECT id_users, name, email, role FROM users WHERE id_users = 1',
  [userId]
 );

 const user = result.rows[0];

 if (!user) {
  console.warn(`>>> /api/auth/me: Utilisateur avec l'ID ${userId} trouve dans le token, 
    mais non trouve en base de donnees.`);
 return res.status(404).json({ message: 'Utilisateur non trouve.' });
 }

// 5. Renvoyer les informations de l'utilisateur au frontend
console.log('>>> /api/auth/me: Verification reussie. Envoi des donnees utilisateur au frontend.');
 res.json({ user: user }); 




} catch(err){
  console.error('>>> /api/auth/me: ERREUR lors de la verification du token ou de la recherche en BD:', err.message);
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expire.' });
}
  res.status(401).json({ message: 'Token non valide.' });

 }


});









module.exports = router;