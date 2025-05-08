const jwt = require('jsonwebtoken');

require('dotenv').config();

module.exports = function (req, res, next){
    const token = req.headers['authorization'];
    if(!token) return res.status(401).json({error: 'Access denied'});

    try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

    } catch{
     res.status(401).json({error: 'Token invalide'});

    }
};