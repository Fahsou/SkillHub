const express= require('express');
const app = express();
const cors = require('cors');
const db = require('./db');
const bodyParser = require('body-parser');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

//middleware 
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}))

//verification de server

app.get('/', (req, res) =>{
    res.send('Bienvenue sur SkillHub ');
});

//import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const missionRoutes = require('./routes/missions');
const applicationsRoutes = require('./routes/applications');
const searchRoutes = require('./routes/search');

//definir les routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/search', searchRoutes);



app.listen(PORT, ()=>{
    console.log(`Serveur demarre sur ${PORT}`);
});