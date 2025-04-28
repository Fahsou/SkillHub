const express= require('express');
const app = express();
const db = require('./db');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

//middleware pour parser le json
app.use(express.json());

//verification de server

app.get('/', (req, res) =>{
    res.send('Bienvenue sur SkillHub ');
});

//route GET user
app.get('/users', async(req,res)=>{

    
});


app.listen(PORT, ()=>{
    console.log(`Serveur demarre sur ${PORT}`);
});