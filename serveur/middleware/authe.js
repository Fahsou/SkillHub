const jwt = require('jsonwebtoken');

require('dotenv').config();

module.exports = function (req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).json({error: 'Token manquant'});

    try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

    } catch (err) {
      console.error('Erreur de validation du token:', err.message);  
     res.status(401).json({error: 'Token invalide'});

    }
};