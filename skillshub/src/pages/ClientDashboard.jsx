import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClientDashboard({user, token} ){

    const[clientStat, setClientStat] = useState(null); // Pour les comptes (publiées, acceptées)
    const[missionWithCount, setMissionWithCount] = useState(null); // Liste mission avec compte candidature

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //------Etat pour gerer affichage des candidatures par mission---------//
    //Clé = id_missions, Valeur = boolean (true si déplié, false si replié)
    const [expandedMissions, setExpandedMissions] = useState({});

    // État pour stocker les listes de candidatures chargées, indexées par l'ID de mission
    // Clé = id_missions, Valeur = tableau des candidatures pour cette mission ([application1, application2, ...])
    const[applicationsByMission, setApplicationsByMission] = useState({});

    const [loadingMissionApps, setLoadingMissionApps] = useState({});
    const [missionAppsError, setMissionAppsError] = useState({});


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

            if(err.response && (err.response.status === 401 || err.response.status === 403 )){
              localStorage.removeItem('token');
            }

      }finally{
        setLoading(false);
      }

     
    }

    fetchInitialClientsMetrics();
   
  }, [user, token]);

  //------Fonction pour recuperer toutes les candidatures pour chaque mission------//
  const fetchAppForMissions = async( missionIdToFetch, currentToken ) =>{
   console.log(`Workspaceing applications for mission ID: ${missionIdToFetch}`);
   if(!missionIdToFetch || !currentToken){
    console.warn('Cannot fetch applications: missing missionId or token.');
    setMissionAppsError(prev => ({ ...prev, [missionIdToFetch]: 'ID de mission manquant pour charger les candidatures.' }));
    setLoadingMissionApps(prev => ({ ...prev, [missionIdToFetch]: false }));
    return; // Arrête la fonction

   }

   setLoadingMissionApps(prev => ({ ...prev, [missionIdToFetch]: true }));
   setMissionAppsError(prev => ({ ...prev, [missionIdToFetch]: null }));


  

     try{
      const reponse = await axios.get(`http://localhost:5000/api/applications/by-mission/${missionIdToFetch}`,
      {
        headers:{'Authorization': `Bearer ${currentToken}` }
      });

      setApplicationsByMission( prev =>({
          ...prev,
          [missionIdToFetch]: reponse.data
      }));

      console.log(`Applications loaded for mission ${missionIdToFetch}: ${reponse.data.length} items`);
      
    }catch(err){
      console.error(`Erreur lors du chargement des candidatures pour la mission ${missionIdToFetch}`, err);
      setError(err.response?.data?.error || err.message || 
        'Erreur lors du chargement des candidatures. ');
      setMissionAppsError(prev => ({ ...prev, [missionIdToFetch]: error }));

      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
    }


     }finally{
      setLoadingMissionApps(prev => ({
        ...prev, [missionIdToFetch]: false
      }));
     }



  }

  // --- Fonction pour gérer le clic sur le bouton "Voir candidatures" par mission -----//
    const handleToggleApp = (mission) =>{
      const missionIdToToggle = mission.id_missions;
      const isCurrentlyExpanded = !!expandedMissions[missionIdToToggle]; // Vérifie l'état actuel (convertit undefined/null en false)
        
      console.log(`Toggling applications visibility for mission ID: ${missionIdToToggle}.
        Currently expanded: ${isCurrentlyExpanded} `);

      // 1. Inverse l'état "déplié" pour cette mission
      setExpandedMissions(prev=>({
        ...prev, 
          [missionIdToToggle]:  !isCurrentlyExpanded
      })) 
      
      //2.Si on est en train de déplier (passer de false à true)
      if(!isCurrentlyExpanded && !applicationsByMission[missionIdToToggle] && token && mission.application_count > 0 ){
        console.log(`Mission ${missionIdToToggle} is being expanded and apps not loaded, initiating fetch`);
      
      fetchAppForMissions(missionIdToToggle, token);
      }
    }
 


  

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
                    const missionId = mission.id_missions;
                    const isExpanded = !!expandedMissions[missionId];
                    const appForThisMission = applicationsByMission[missionId];
                    const isLoadingApps = !!loadingMissionApps[missionId];
                    const missionAppError = missionAppsError[missionId];
                    
                    
                    return(
                      <li key={missionId}  
                      style={{ marginBottom: '10px',  padding: '10px' }}> 
                      <p>
                         {mission.title} : {mission.application_count} {' '}
                        {parseInt(mission.application_count, 10) > 1? 'candidatures':'candidature'}
                        {/* --- NOUVEAU BOUTON PAR MISSION --- */}
                        {mission.application_count >0 && (
                          <button onClick={ ()=>handleToggleApp(mission) } 
                          style={{ marginLeft: '15px', padding: '5px 10px', cursor: 'pointer' }}
                            {...isExpanded ? 'Masquer candidature':`Voir candidatures (${mission.application_count})`}
                          >  </button> 
                        )}
                        </p>

                        {isExpanded && (
                          <div style={{ marginTop: '10px', paddingTop: '10px' }} > 
                          <h6>Candidatures pour cette missions:</h6>

                          {isLoadingApps? (
                            <p> Chargement des candidatures pour "{mission.title}"...</p>
                          ): missionAppError? (
                            <p style={{ color: 'red' }}>{missionAppError}</p>
                          ): Array.isArray(appForThisMission)  && appForThisMission.length>0? (
                            <ul>
                              {appForThisMission.map(app =>{
                                return (
                                  <li key={app.id_applications} style={{ fontSize: '0.9em', marginBottom: '5px' }} >
                                    Postule par: <strong> {app.freelancer_name} </strong>
                                    Statut: {app.application_status}
                                    Message : {app.message_content.substring(0, 50)}...
                                    Postulé le : {new Date(app.application_date).toLocaleDateString()}


                                  </li>
                                )
                              })}
                            </ul>
                          ): Array.isArray(appForThisMission) && appForThisMission.length === 0? 
                           <p>Aucune candidature trouvee</p>
                          : null

                          }

                          </div>
                        ) }
                      </li>
                    );
                  } )}

                </ul>
              ): (
                <p> Vous n'avez pas encore de missions avec de candidatures </p>
              ) }

           {/*  <button onClick={handleViewAllApp} style={{ marginTop: '20px', padding: '10px 15px', cursor: 'pointer' }}>
              
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
              )}*/}

              {/*Lien */}
              <p style={{ marginTop: '20px' }}> Ajoutez ici d'autres informations ou liens pour le client.</p>

        </div>
    );
  }
  return <p> Preparation du Tableau </p>
}