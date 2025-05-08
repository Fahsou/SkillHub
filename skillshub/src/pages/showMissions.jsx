import React, {useState, useEffect} from "react";
import axios from 'axios';


//recuperation de tous les missions via get/api/missions/
//gestion des etats

export default function ShowMissions(){
   const [missions, setMissions] = useState([]); //stoke liste des missions
   const [loading, setLoading] = useState(true); //gestion affichage chargement
   const [error, setError] = useState(null); // gestion des erreurs

   useEffect(()=>{
    
        const fetchMissions = async () =>{
            try{
                const reponse = await axios.get('http://localhost:5000/api/missions/showMissions');
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
        </div>
    )
}