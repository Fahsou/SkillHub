import React, {useState, useEffect} from "react";
import axios from 'axios';
import { Link } from "react-router-dom";


//recuperation de tous les missions via get/api/missions/
//gestion des etats

export default function ShowMissions(){
   const [missions, setMissions] = useState([]); //stoke liste des missions
   const [loading, setLoading] = useState(true); //gestion affichage chargement
   const [error, setError] = useState(null); // gestion des erreurs

   useEffect(()=>{
    
        const fetchMissions = async () =>{
            try{
                const reponse = await axios.get('/api/missions/showMissions');
                console.log('Reponse API', reponse); //reponse de axios
                console.log('Liste des missions', reponse.data); //Liste mission

                setMissions(reponse.data); //axios met les donnees dans .data
                
            } catch(err){
                console.error('Erreur lors de la recuperation des missions:', err);
                setError('Impossible de charger les missions' + (err.reponse?.data?.error || err.message));

            } finally{
                setLoading(false);
            }
        };
        fetchMissions();

   }, []);
    
   if(loading){
    return <p>Chargement...</p>
   }

   if(error){
    return <p className="message-error">{error}</p>
   }
    
    return(
        <div className="mission-container">
            <h2>Liste des missions</h2>
            {missions.length > 0 ? ( 
               <div className="missions-list"> 
                   {missions.map(mission => (
                       <div key={mission.id_missions} className="mission-item">
                           <h3>{mission.title}</h3>
                           <p>{mission.description}</p>
                           {mission.created_at && (
                               <p>Créée le: {new Date(mission.created_at).toLocaleDateString()}</p>
                            
                           )}
                           
                           <Link to={`/missions/${mission.id_missions}`}>Voir plus </Link>
                       </div>
                       
                   ))}
               </div>
           ) : (
               <p>Aucune mission trouvée pour le moment.</p>
           )}

          
           
        </div>
    )
}