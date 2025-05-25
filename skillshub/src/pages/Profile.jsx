import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/Token";
import {Link} from 'react-router-dom';
import './profile.css'

export default function Profile() {

  const [user, setUser] = useState(null); //etat pour l'utilisateur
  const [skills, setSkills] = useState([]); //etat pour les competences
  const [showForm, setShowForm] = useState(false); 
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const token = getToken();

  useEffect(() => {
    const fetchProfileAndSkills = async () => {
      try {
        // Charger les infos utilisateur
        const resUser = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile`, {  //api/users/profile
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = resUser.data.user;
        setUser(userData);

        //  Charger les compétences si freelance
        if(userData.role === 'freelance'){
        const resSkills = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/getskills`, {  //api/users/getskills
          headers: { Authorization: `Bearer ${token}` },
        });
        const extractedSkills = resSkills.data.skills.map(s => s.skill_name);
        setSkills(extractedSkills);
      }
      setError("");

      } catch (err) {
        console.error("Erreur lors du chargement du profil ou des compétences", err);
        setError(`Erreur de chargement de profil`, err);
      }
    };

    fetchProfileAndSkills();
  }, [token]);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    setLoading(true);
    try {
       await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/addskills`,  //api/users/addskills
        { skillName: newSkill },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Recharger les compétences après ajout
      const resSkills = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/getskills`, {   //api/users/getskills
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedSkills = resSkills.data.skills.map(s => s.skill_name);
      setSkills(updatedSkills);

      setNewSkill("");
      setShowForm(false);
      setError('');
    } catch (err) {

      if (err.response?.status === 409) {
        //alert("Cette compétence existe déjà !");
        setError('Cette compétence existe déjà !');
      } else {
        console.error("Erreur lors de l'ajout", err);
        setError('Erreur lors de l\'ajout', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Chargement...</p>;
  //if(error) return <p> {error} </p>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">Bienvenue {user.name}</h1>
      <p className="profile-subtitle" >Email : {user.email}</p>
      <p className="profile-subtitle" >Rôle : {user.role}</p>

     <button className="button-role"> <Link to="/dashboard"> Voir mon tableau de bord </Link> </button>
     
     
    {user.role ==='freelance'?
     <button className="button-role"> <Link to="/showMissions"> Postuler à une mission </Link> </button>:
     <button className="button-role"> <Link to="/createMission"> Créer une mission </Link> </button>
    }

    {user.role ==='freelance' && (
      <>
      <h2 className="skill-title" > Compétences </h2>
      <ul className="skill-list">
        {skills.length>0 ? (

          skills.map( (skill, idx)=> <li key={idx} className="skill-lists" > {skill} </li> )
       ): (
          <p className="skill-nope"> Aucune compétence </p>
        )}
      </ul>

      {showForm?(
        <div className="form-skill">
          <input type="text" className="input-skill"
          value={newSkill}
          onChange={(e)=> setNewSkill(e.target.value) }
          placeholder="Nouvelle competence" 
          />
          <button onClick={handleAddSkill} disabled={loading} className="button-add" >
          {loading? 'Ajout...' : 'Ajouter'}
          </button>
          <button onClick={()=> setShowForm(false) } className="button-cancel" > Annuler </button>
        </div>
      ): (
        <button  onClick={()=>setShowForm(true) } className="button-add" >+ Ajouter une compétence </button>
      ) }
     
     </>
    )}  

    {error && <p className="error-message">{error} </p>}
   
</div>
  );
}

