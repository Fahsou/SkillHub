import React, {useState, useEffect} from "react";
import axios from 'axios';


//recuperation de tous les missions via get/api/missions/
//gestion des etats

export default function showMissions(){
   const [missions, setMissions] = useState([]); //stoke liste des missions
   const [loading, setLoading] = useState([]); //gestion affichage chargement
   const [error, setError] = useState([]); // gestion des erreurs

   useEffect(()=>{
    
        const fetchMissions = async () =>{
            try{
                const reponse = await axios.get('http://localhost:5000/api/missions/showMissions');
                console.log('Liste des missions', reponse.data);

                const data = await reponse.json();
                setMissions(data);
                
            } catch(err){
                console.error('Erreur lors de la recuperation des missions:', err);
                setError('Impossible de charger les missions');

            } finally{
                setLoading(false);
            }
        }
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
        </div>
    )
}