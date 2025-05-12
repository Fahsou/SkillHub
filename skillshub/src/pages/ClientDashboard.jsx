import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

export default function ClientDashboard({user, token} ){

    const[clientStat, setClientStat] = useState(null); // Pour les comptes (publiées, acceptées)
    const[missionWithCount, setMissionWithCount] = useState(null); // Liste mission avec compte candidature

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //------Etat pour liste des candidatures---------//
    const [showApplications, setShowApplications] = useState(false);
    const [allApplications, setAllApplications] = useState(null); //stocke la liste
    const [loadingAllApplication, setLoadingAllApplication] = useState(false);
    const [allApplicationError, setAllApplicationError ] = useState(null);


   useEffect(()=>{
   
    const fetchInitialClientsMetrics = async () =>{
        setLoading(true);
        setError(null);

      if(!user || !token ){
        setError('Informations utilisateur manquantes pour charger le tableau de bord client');
        setLoading(false);
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
                (err.response?.data?.error || err.message)); 

      }finally{
        setLoading(false);
      }

     
    }

    fetchInitialClientsMetrics();
   
  }, [user, token]);

  //------Fonction appele lorsque le bouton est clique pour voir toutes les candidatures------//
  const fetchAllApplications = async(currentToken) =>{
    setLoadingAllApplication(true);
    setAllApplicationError(false);

    try{
      const reponse = await axios.get('http://localhost:5000/api/applications/by-client',
        {
          headers: {'Authorization': `Bearer ${currentToken}`}
        }
      )

      setAllApplications(reponse.data);
      console.log(`Liste complète des candidatures chargées: ${reponse.data.length} items`);

    }catch(err){
      console.error('Erreur lors du chargement de toutes les candidatures du client:', err);
      setAllApplicationError('Impossible de charger la liste complète des candidatures: ' +
        (err.response?.data?.error || err.message)
       );

       // Gérer les erreurs d'authentification (401/403) pour cet appel spécifique
       if(err.response && (err.response.status === 401 || err.response.status === 403) ){
          localStorage.removeItem('token');
          // navigate('/login');
       }

    }finally{
      setLoadingAllApplication(false);
    }

  }

  useEffect( ()=>{
    
    if(showApplications && allApplications== null && token ){
      console.log('showAllApplications activé et liste non chargée, fetching all applications...');
      fetchAllApplications(token);
    }

  }, [showApplications, token] );

  // --- NOUVELLE Fonction pour gérer le clic sur le bouton "Voir toutes les candidatures" ---
  const handleViewAllApp = () =>{
    console.log('Bouton Voir toutes les candidatures cliqué. Toggling visibility...');
    setShowApplications(!showApplications);
  };

  if(loading){
    return <p> Chargement... </p>
  }

  if(error){
    return <p style={{color: 'red'}} > {error} </p>
  }

  
   if(clientStat ){
    return(
        <div className="client-dash-container">
            <h3> Tableau de bord  : </h3>

            <p> Nombre de missions publié: {' '}
                 {clientStat?.publishedCount !== undefined? clientStat.publishedCount  : 'N/A' }
             </p>
            <p> Nombre de missions acceptées: {' '}
                 {clientStat?.acceptedCount !== undefined? clientStat.acceptedCount  : 'N/A' }
             </p> {/* Depend de la colonne status de la mission DB */}

             <h4> Candidature par mission: </h4>
             {/* Vérifier si la liste de missions n'est pas vide avant de mapper */}
              {Array.isArray(missionWithCount) && missionWithCount.length >0 ? (
                <ul>
                  {missionWithCount.map(mission =>{
                    return(
                      <li key={mission.id_missions} >
                         {mission.title} : {mission.application_count} {' '}
                        {parseInt(mission.application_count, 10) > 1? 'candidatures':'candidature'}
                      </li>
                    );
                  } )}

                </ul>
              ): (
                <p> Vous n'avez pas encore de missions avec de candidatures </p>
              ) }

              <button onClick={handleViewAllApp} style={{ marginTop: '20px', padding: '10px 15px', cursor: 'pointer' }}>
              
              {showApplications?'Masquer toutes les candidatures ':' Voir toutes les candidatures' }
              </button>

              {showApplications && (
                <div className="all-app-section"  style={{ marginTop: '30px' }} >
                    <h4> Toutes les candidatures recues: </h4>
                  {loadingAllApplication? (
                    <p> Chargement des listes: </p>
                  ) : allApplicationError?(
                    <p style={{color: 'red'}} > {allApplicationError} </p>
                  ): Array.isArray(allApplications) && allApplications.length>0? (
                    //---Maper la liste---//
                    <ul>
                      {allApplications.map( app =>{
                        return(
                        <li key={app.id_applications}>
                        {app.mission_title}- Postulé par: {app.freelancer_name}
                        -Status: {app.application_status}
                        Message: {app.message_content.substring(0,50)}...
                        Postulé le: {new Date(app.application_date).toLocaleDateString()}
                        <Link to={`missions/${app.mission_id}`}> Mission </Link>
                        <Link to={`users/${app.freelancer_id}`} > Freelancer </Link>
                        </li>
                       );
                      
                      }
                    )}
                    
                    </ul>
                  ) : Array.isArray(allApplications) && allApplications === 0? (
                    <p> Aucune candidature n'a ete soumise </p>
                  ): (
                    null
                  )}

                </div>
              )}

              {/*Lien */}
              <p style={{ marginTop: '20px' }}> Ajoutez ici d'autres informations ou liens pour le client.</p>

        </div>
    );
  }
  return <p> Preparation du Tableau </p>
}