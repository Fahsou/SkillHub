import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/Token"; // Utilitaire pour récupérer le token
import {Link} from "react-router-dom";

export default function Profile() {
  //etat pour profil
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = getToken();

  //Etats pour competences
  const [userSkills, setUserSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [errorSkill, setErrorSkills] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {

      const token = getToken();
      if (!user|| !token){
        setLoading(false);
        return;
      }

      try {
       
        const res = await axios.get("http://localhost:5000/api/users/profile", 
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data.user);

      } catch (err) {
        console.error("Erreur lors de la recuperatin de profil",err);
        setError("Erreur lors du chargement du profil");
        
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(()=>{
    const fetchSkillsData = async()=>{
      if(!user){
        setLoadingSkills(false);
        return;
      }
      
      setLoadingSkills(true);
      setErrorSkills('');

      try{
        //Recupere toutes les competences dispo
        console.log(">>> Profile.jsx useEffect (Skills): Appel API GET /api/skills...");

        const allSkillsRes = await axios.get('http://localhost:5000/api/skills');

        if(allSkillsRes.data){
        setAllSkills(allSkillsRes.data);
        console.log('>>> Profile.jsx useEffect (Skills): Toutes les competences recues:', 
          allSkillsRes.data.length);
        }else{
          setAllSkills([]);
          console.warn('>>> Profile.jsx useEffect (Skills): Reponse /api/skills - Donnees manquantes.');
        }

        //recupere toutes les competences d'un utilisateur conncete
        if(token){
          console.log('>>> Profile.jsx useEffect (Skills): Appel API GET /api/profile/skills (avec token)...');

          const userSkillsRes = await axios.get('http://localhost:5000/api/users/profile/skills', 
            {
              headers: {
                'Authorization': `Bearer ${token}` //envoi le token
              }
            });

          console.log('>>> Profile.jsx useEffect (Skills): Reponse /api/profile/skills recue:',
            userSkillsRes.data );

            // Verifie si la reponse contient bien la cle 'skills' avec un tableau
            if(userSkillsRes.data && Array.isArray(userSkillsRes.data.skills) ){
              setUserSkills(userSkillsRes.data.skills); //mise a jour de l'etat 

              console.log('>>> Profile.jsx useEffect (Skills): Competences utilisateur recues:',
                userSkillsRes.data.skills.length );

            }else{
              setUserSkills([]);
              console.warn(`>>> Profile.jsx useEffect (Skills): 
                Reponse /api/profile/skills - Donnees manquantes ou format inattendu.`);
             }

        } else{//token indispo
          console.log(`>>>Profile.jsx useEffect (Skills): Token non disponible, 
            impossible de charger les competences de l'utilisateur.` );
            setUserSkills([]);
        }

      }catch(err){
          console.error('>>> Profile.jsx useEffect (Skills): ERREUR lors du chargement des competences:', err);
          setErrorSkills('Erreur lors du chargement des competences.');
          setAllSkills([]);
          setUserSkills([]);
      }finally{
        setLoadingSkills(false);
      }

    }
     fetchSkillsData();

  }, [user, token]);

  if(!user){
    return <div className="profile-container" > Chargement du profil ou utilisateur non connecté </div>
  }

  console.log(">>> Profile.jsx rendu: user est défini. Affichage du profil.");



  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-600" >{error}</p>;

  return (
    <div className="profil-container">
      <h2 className="text-2xl font-bold mb-4">Mon Profil</h2>
      <p><strong>Nom :</strong> {user.name}</p>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Role :</strong> {user.role}</p>
      
      <button>
      <Link to="/dashboard"> Voir mon tableau de bord </Link>
      </button>
     {user.role ==='freelance'? (
      <>
       <button>
        <Link to="/showMissions" > Postuler a une mission </Link>
       </button>
      </>
     ):(
        <button>
          <Link to="/createMission" > Creer une mission </Link>
        </button>

     ) }

     {/* --- SECTION DES COMPÉTENCES (VISIBLE UNIQUEMENT POUR LES FREELANCERS) --- */}
      {user.role === 'freelance' && (
        <div className="profil-skill-container">
          <h3> Competences </h3>

          {loadingSkills? (
            <p> Chargement des competences </p>
          ): errorSkill? (
            <p className="error-message" > {errorSkill} </p>
          ): (
            <>
            {userSkills.length>0? (
              <ul>
                {userSkills.map(skill =>{
                  return(
                    <li key={skill.id_skills}> {skill.name} </li>
                  )
                } )}
              </ul>
            ): (
              <p> Aucune competence ajoute pour l'instant </p>
            ) }
              

               </>
          ) }



        </div>

      )}


 </div>
  );
}