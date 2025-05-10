import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClientDashboard({user, token} ){

    const[clientStat, setClientStat] = useState(null); // Pour les comptes (publiées, acceptées)
    const[missionWithCount, setMissionWithCount] = useState(null); // Liste mission avec compte candidature

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

   useEffect(()=>{
   
    const fetchClientsMetrics = async () =>{
        setLoading(true);
        setError(null);

      if(!user || !token ){
        setError('Informations utilisateur manquantes pour charger le tableau de bord client');
        setLoading(true);
        return;
      }

      try{
        // Utiliser Promise.all pour lancer plusieurs requêtes client en parallèle
        const [publishedCountReponse, acceptedCountReponse, missionHasApplication] = await Promise.all([
         //appel de nombre de mission publie
         axios.get('http://localhost:5000/api/missions/count/published-by-client', 
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
        // Appel pour le nombre de missions acceptées
         axios.get('http://localhost:5000/api/missions/count/accepted-by-client', 
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
         // Appel pour la liste des missions du client avec compte candidatures 
         axios.get('http://localhost:5000/api/missions/count/mission-has-application', 
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }),

        ]);
        // Met à jour les états avec les données récupérées
        setClientStat({
            publishedCount: publishedCountReponse.data.count,
            acceptedCount: acceptedCountReponse.data.count // Stocke le compte des missions acceptées
        });

        setMissionWithCount(missionHasApplication.data); //

        } catch (err) {
            console.error('Erreur lors du chargement des métriques client:', err);
            setError('Impossible de charger les données du tableau de bord client : ' + 
                (err.reponse?.data?.error || err.message)); 

      }finally{
        setLoading(false);
      }

     
    }

    fetchClientsMetrics();
   
  }, [user, token]);

  if(loading){
    return <p> Chargement... </p>
  }

  if(error){
    return <p style={{color: 'red'}} > {error} </p>
  }

  

    return(
        <div className="client-dash-container">
            <h3> Tableau de bord: </h3>

            <p> Nombre de missions publié:
                {clientStat.publishedCount !== undefined? clientStat.publishedCount  : 'N/A' }
             </p>
            <p> Nombre de missions acceptées:
                {clientStat.acceptedCount !== undefined? clientStat.acceptedCount  : 'N/A' }
             </p> {/* Depend de la colonne status de la mission DB */}

             <h4> Candidature par mission: </h4>
             {/* Vérifier si la liste de missions n'est pas vide avant de mapper */}
             {missionWithCount.length >0?(
                <ul>
                    {missionWithCount.map( mission =>{
                        <li key={mission.id_missions} >
                        Mission "{mission.title}": {mission.application_count} {parseInt(mission.application_count,
                            10 > 1? 'candidatures' : 'candidature' )}
                            {/* Lien vers mission */}
                        </li>
                    } )}
                </ul>

             ): (
                <p> Vous n'avez pas encore de missions avec des candidatures. </p>
             ) }

              {/*Lien */}
              <p>Ajoutez ici d'autres informations ou liens pour le client.</p>

        </div>
    );
}