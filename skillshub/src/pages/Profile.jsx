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
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [errorSkill, setErrorSkills] = useState('');

  //Etat pour ajouter competences
  const[newSkillName, setNewSkillName] = useState('');
  const[addingSkill, setAddingSkill] = useState(false);
  const[addSkillError, setAddSkillError] = useState('');

  //------UseEffect pour charger le profil --------------//

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
    const fetchUserSkills = async()=>{
      if(!user){
        setLoadingSkills(false);
        setUserSkills([]);
        return;
      }
      if(user.role === 'freelance' && token){
        setLoadingSkills(true);
        setErrorSkills('');
        setUserSkills([]);
      

      try{
        //Recupere toutes les competences dispo
        console.log(">>> Profile.jsx useEffect (Skills): Appel API GET /api/user/getskills...");

        const userSkillsRes = await axios.get('http://localhost:5000/api/users/getskills', 
          {
            headers:{
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log(">>> Profile.jsx useEffect (User Skills): Reponse /api/users/getskills recue:",
           userSkillsRes.data);



        if(userSkillsRes.data && Array.isArray(userSkillsRes.data.skills)){
        setUserSkills(userSkillsRes.data.skills);
        console.log('>>> Profile.jsx useEffect ( Users Skills): GET /api/users/getskills', 
          userSkillsRes.data.skills.length);
        }else{
          setUserSkills([]);
          console.warn(`>>> Profile.jsx useEffect (Users Skills): Reponse /api/users/getskills 
            - Donnees manquantes. ou format inattendu`);
        }

   }catch(err){
          console.error('>>> Profile.jsx useEffect (Users Skills): ERREUR lors du chargement des competences:', err);
          setErrorSkills('Erreur lors du chargement des competences.');
          setUserSkills([]);
      }finally{
        setLoadingSkills(false);
      }
    
   }else{
    console.log(`>>> Profile.jsx useEffect (User Skills): Pas un freelancer ou token manquant.
       Pas de chargement des competences utilisateur.`);
        setLoadingSkills(false);
        setUserSkills([]);

   }

    }
     fetchUserSkills();

  }, []);

  //---------Fonction pour ajouter des competences----------//
  const handleAddSkill = async(e) =>{
    e.preventDefault();

    const skillNameToAdd = newSkillName.trim();

    setAddingSkill(true);
    setAddSkillError('');

    //---validation frontend
    if(!skillNameToAdd){
      console.warn(">>> Profile.jsx handleAddSkill: Nom de competence vide.");
        setAddSkillError("Veuillez entrer un nom de competence.");
        setAddingSkill(false);
        return;

    }

    

    // Verifier si l'utilisateur a deja cette competence 
    const userAlreadyHasSkill = userSkills.some(skill => 
      skill.skill_name.toLowerCase() === skillNameToAdd.toLowerCase() );
    if(userAlreadyHasSkill){
      console.warn(`>>> Profile.jsx handleAddSkill: Utilisateur a deja la competence ID 
        ${skillNameToAdd}`);
        setAddSkillError('Competence déjà ajoute');
        setAddingSkill(false);
        return;
    }

    // --- 2. Appeler la route backend POST pour ajouter la competence ---
  try{
    console.log(` >>> Profile.jsx handleAddSkill: Appel API POST /api/users/addskills
       pour ajouter la competence ID ${skillNameToAdd}`);

       const response = await axios.post('http://localhost:5000/api/users/addskills',
        {skillName: skillNameToAdd}, //Corps de la requete: l'ID de la competence
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
       );

       console.log('>>> Profile.jsx handleAddSkill: Reponse API POST /api/users/addskills recue:',
        response.data
       );

       // --- 3. Mettre a jour l'etat frontend si l'ajout a reussi ---
      const addedSkillObject = {skill_name: skillNameToAdd};
      setUserSkills([...userSkills, addedSkillObject]);
      console.log(">>> Profile.jsx handleAddSkill: Etat userSkills mis a jour localement.");


    
  }catch(err){
    console.error(`>>> Profile.jsx handleAddSkill: ERREUR lors de l'ajout de la competence:`,err);

    if(err.response && err.response.data && err.response.data.message){
      setAddSkillError(err.response.data.message);
    } else{
      setAddSkillError('Erreur reseau ou serveur lors de l\'ajout de la competence.');
    }
  
  }finally{
    setAddingSkill(false);
  }



  }

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
                    <li key={skill.id_skills}> {skill.name}
                    <button> Supprimer </button>
                     </li>
                  )
                } )}
              </ul>
            ): (
              <p> Aucune competence ajoute pour l'instant </p>
            ) }
            {/* --- INTERFACE POUR AJOUTER UNE NOUVELLE COMPÉTENCE --- */}
             <form onSubmit={handleAddSkill} >
              <input
              type="text"
              placeholder="Ajouter une competence"
              value={newSkillName}
              onChange={(e)=> setNewSkillName(e.target.value) }
              disabled = {loadingSkills|| addingSkill}
              className="add-skill-input"              
               />
              <button  type="submit" 
              disabled={!newSkillName.trim() || loadingSkills ||addingSkill }
              className="add-skill-button"
              > {addingSkill? 'Ajout...': 'Ajouter compétences'} </button>

             </form>
             {addingSkill && <p> Ajout de competences </p> }
             {addSkillError && <p className="error-message"> Erreur d'ajout: {addSkillError} </p>}
              

               </>
          ) }



        </div>

      )}


 </div>
  );
}