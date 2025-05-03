const express= require('express');
const app = express();
const cors = require('cors');
const db = require('./db');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

//middleware pour parser le json
app.use(express.json());
app.use(cors());

//verification de server

app.get('/', (req, res) =>{
    res.send('Bienvenue sur SkillHub ');
});

//import des routes
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const missionRoutes = require('./routes/missions');
const applicationsRoutes = require('./routes/applications');

//definir les routes
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/applications', applicationsRoutes);



app.listen(PORT, ()=>{
    console.log(`Serveur demarre sur ${PORT}`);
});