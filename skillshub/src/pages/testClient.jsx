import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {getToken} from '../utils/Token';


export default function ClientDash({user, token} ){ // Reçoit user et token en tant que props

    // --- États pour les métriques spécifiques au client (comptes) ---
    const[clientStat, setClientStat] = useState(null); // Pour les comptes (publiées, acceptées)
    // La première liste des missions QUI ONT des candidatures, avec leur compte total de candidatures
    const[missionWithCount, setMissionWithCount] = useState(null);

    // États pour gérer le chargement et les erreurs des métriques initiales (comptes + première liste)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // --- États pour gérer l'affichage et les données des candidatures PAR MISSION ---
    // État pour savoir quelle mission est "dépliée" (afficher sa liste de candidatures)
    const [expandedMissions, setExpandedMissions] = useState({});

    // État pour stocker les listes de candidatures chargées, indexées par l'ID de mission
   const[applicationsByMission, setApplicationsByMission] = useState({});

    // États de chargement et d'erreur spécifiques pour les appels API de chaque liste de candidatures par mission

    const [loadingMissionApps, setLoadingMissionApps] = useState({});
    const [missionAppsError, setMissionAppsError] = useState({});

    // --- États pour gérer la MISE À JOUR du statut d'une candidature ---
    const [updatingApp, setUpdatingApp] = useState(null);
    const [updateError, setUpdateError] = useState(null);


   // --- useEffect pour récupérer les métriques initiales et la première liste ---
   useEffect(()=>{
    const fetchInitialClientData = async () =>{ // Renommé la fonction pour la clarté
        setLoading(true);
        setError(null);

        // Vérification de user et token
        if(!user || !token ){
            setError('Informations utilisateur manquantes pour charger le tableau de bord client.');
            setLoading(false);
            return;
        }

        try{
            // --- Promise.all pour les requêtes initiales ---
            const [publishedCountReponse, acceptedCountReponse, missionHasApplicationResponse] = await Promise.all([
                 axios.get('http://localhost:5000/api/missions/count/published-by-client', { headers: { 'Authorization': `Bearer ${token}` } }),
                 axios.get('http://localhost:5000/api/missions/count/accepted-by-client', { headers: { 'Authorization': `Bearer ${token}` } }),
                 axios.get('http://localhost:5000/api/missions/count/mission-has-application', { headers: { 'Authorization': `Bearer ${token}` } }), // <-- Endpoint
            ]);

            // --- Mise à jour des états initiaux ---
            setClientStat({
                publishedCount: publishedCountReponse.data.count,
                acceptedCount: acceptedCountReponse.data.count
            });

            setMissionWithCount(missionHasApplicationResponse.data);

        } catch (err) {
            console.error('Erreur lors du chargement initial des données client:', err);
            setError('Impossible de charger les données initiales du tableau de bord client : ' +
                (err.response?.data?.error || err.message));

             // Gérer les erreurs d'authentification initiales
             if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                 localStorage.removeItem('token');
                 // navigate('/login'); // Si navigate dispo
             }

        }finally{
            setLoading(false); // Le chargement initial est terminé
        }
    };

    fetchInitialClientData(); // Appelle la fonction de récupération initiale

   }, [user, token]); 


    // --- Fonction pour récupérer les candidatures pour UNE mission spécifique (appelée par le bouton) ---
   
    const fetchApplicationsForMission = async (missionIdToFetch, currentToken) => {
        
        console.log(`Workspaceing applications for mission ID: ${missionIdToFetch}`);
        // Vérification de l'ID et du token avant l'appel (sécurité)
         if (!missionIdToFetch || !currentToken) {
              console.warn('Cannot fetch applications: missing missionId or token.');
              // Mettre une erreur spécifique à cette mission si l'ID est manquant au moment du fetch
              setMissionAppsError(prev => ({ ...prev, [missionIdToFetch]: 'ID de mission manquant pour charger les candidatures.' }));
              setLoadingMissionApps(prev => ({ ...prev, [missionIdToFetch]: false }));
              return; // Arrête la fonction
         }

       
        setLoadingMissionApps(prev => ({ ...prev, [missionIdToFetch]: true }));
        
        setMissionAppsError(prev => ({ ...prev, [missionIdToFetch]: null }));

        try {
            // --- Appel API vers la route backend par ID de mission ---
          
     const reponse = await axios.get(`http://localhost:5000/api/applications/by-mission/${missionIdToFetch}`, { // <-- Template literal correct
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });

            
            // Utilise la mise à jour fonctionnelle pour ajouter ou mettre à jour l'entrée pour cette missionId
            setApplicationsByMission( prev =>({
                ...prev, // Copie les missions déjà présentes
                [missionIdToFetch]: reponse.data // Ajoute/met à jour la liste pour missionIdToFetch
            }));
            console.log(`Applications loaded for mission ${missionIdToFetch}: ${reponse.data.length} items.`);


        } catch (err) {
            console.error(`Erreur lors du chargement des candidatures pour la mission ${missionIdToFetch}:`, err);
            const errorMessage = err.response?.data?.error || err.message || 'Erreur lors du chargement des candidatures.';
            
            setMissionAppsError(prev => ({ ...prev, [missionIdToFetch]: errorMessage }));

            // Gérer les erreurs d'authentification (401/403)
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem('token');
                // navigate('/login'); // Si navigate dispo
            }

        } finally {
           
            setLoadingMissionApps(prev => ({ ...prev, [missionIdToFetch]: false }));
        }
    };


    // --- Fonction pour gérer le clic sur le bouton "Voir candidatures" par mission -----//

    const handleToggleApplications = (mission) => { // Prend l'objet mission
        const missionIdToToggle = mission.id_missions;
        
        const isCurrentlyExpanded = !!expandedMissions[missionIdToToggle];

        console.log(`Toggling applications visibility for mission ID: ${missionIdToToggle}. Currently expanded: ${isCurrentlyExpanded} `);

        // 1. Inverse l'état "déplié" pour cette mission spécifique
        setExpandedMissions(prev=>({
            ...prev,
            [missionIdToToggle]:  !isCurrentlyExpanded // Inverse l'état pour missionIdToToggle
        }))

        // 2. Déclenche le fetch UNIQUEMENT si on est en train de déplier ET que les données pour cette mission n'ont PAS ENCORE été chargées
        
        if (!isCurrentlyExpanded && !applicationsByMission[missionIdToToggle] && token && mission.application_count > 0) {
             console.log(`Mission ${missionIdToToggle} is being expanded and apps not loaded, initiating fetch.`);
             
             fetchApplicationsForMission(missionIdToToggle, token); // Déclenche la récupération
        }
        // Note : Si mission.application_count est 0, on déploie, mais le fetch n'est pas déclenché par cette condition.
    };

  // --- NOUVELLE Fonction pour gérer la MISE À JOUR du statut d'une candidature 
   const handleUpdateAppStatus = async(applicationId, newStatus) =>{
    console.log(`Attempting to update status for application ${applicationId} to ${newStatus}`);
        setUpdateError(null);
    // Empêche de lancer plusieurs mises à jour en même temps pour la même candidature ou si une autre est en cours
   if(updatingApp){
    console.warn(`Another application (${updatingApp}) is already being updated`);
    return;
   }
    setUpdatingApp(applicationId);
    const currentToken= token;

    // Vérification basique 
    if(!applicationId || !newStatus || !currentToken){
        console.error('Missing info for status update:', { applicationId, newStatus, currentToken });
        setUpdateError('Impossible de mettre à jour le statut : informations manquantes');
        setUpdatingApp(null);
    return;
    }

    try{
        const reponse = await axios.put(`http://localhost:5000/api/applications/${applicationId}/status`,
            {status: newStatus}, //envoi le nouveau statu dans le crsp de la requete
            {
                headers: {'Authorization': `Bearer ${currentToken}` }
            }
        );
        console.log(`Status updated successfully for application ${applicationId}:`, reponse.data);
        console.log('Donnees recus du backend', reponse.data);
        setApplicationsByMission(prev =>{
            const updatedState = {...prev};

            for(const missionId in updatedState){
                const appIndex = updatedState[missionId].findIndex(app => app.id_applications === applicationId);

                if(appIndex!== -1){
                    updatedState[missionId][appIndex] = reponse.data;
                    console.log(`Frontend state updated for application ${applicationId} in mission ${missionId}.`);
                    break; // La mise à jour est faite, on peut sortir de la boucle
                }
            }
            return updatedState;
        })

    }catch(err){
        console.error(`Erreur lors de la mise à jour du statut de la candidature ${applicationId}:`, err);
        const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la mise à jour du statut.';
        setUpdateError(`Échec de la mise à jour du statut ID ${applicationId}: ${errorMessage}`);

        if(err.response && (err.response.status ===401 || err.response.status === 403)){
            localStorage.removeItem('token');
        }

    }finally{
        setUpdatingApp(null);

    }
  };

  const handleAcceptClick = (applicationId)=>{
    handleUpdateAppStatus(applicationId, 'accepted');
  };

  const handleRejectClick = (applicationId)=>{
    handleUpdateAppStatus(applicationId, 'rejected');
  };


    // --- Logique de Rendu ---

    // Si en cours de chargement initial
if(loading){
        return <p> Chargement initial du tableau de bord client...</p>
    }

    // Si une erreur s'est produite pendant le chargement initial
if(error){
        return <p style={{color: 'red'}} > {error} </p>
    }

    // --- Rendu principal si les données initiales sont chargées (au moins clientStat) ---
    // On vérifie si clientStat est chargé pour afficher la première partie du dashboard
if(clientStat){
     return(
    <div className="client-dash-container">
        <h3> Tableau de bord Client : </h3>

                {/* --- Section des Métriques (Comptes) --- */}
        <p> Nombre de missions publiées : {' '} {/* Espace ajouté */}
             {clientStat?.publishedCount !== undefined ? clientStat.publishedCount  : 'N/A' }
        </p>
         <p> Nombre de missions acceptées : {' '} {/* Espace ajouté */}
            {clientStat?.acceptedCount !== undefined ? clientStat.acceptedCount  : 'N/A' }
        </p>

                 {/* --- Section "Missions avec candidatures" (la première liste mappée, avec les NOUVEAUX boutons) --- */}
        <h4> Missions avec candidatures : </h4> {/* Titre ajusté */}

                 {/* Vérifier si missionWithCount est un tableau ET s'il a des éléments */}
     {Array.isArray(missionWithCount) && missionWithCount.length > 0 ? (
        <ul>
                        {/* --- Mapper sur la première liste des missions avec candidatures --- */}
        {missionWithCount.map( mission => { // Pour chaque mission de cette liste...
         const missionId = mission.id_missions;
         const isExpanded = !!expandedMissions[missionId]; 
        const appsForThisMission = applicationsByMission[missionId]; 
        const isLoadingApps = !! loadingMissionApps[missionId]; 
        const missionAppError = missionAppsError[missionId]; 

        return ( // Retourne l'élément LI pour cette mission
         <li key={missionId} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}> {/* Styles de base */}
                                     {/* Infos de base de la mission + le bouton */}
            <p>
             Mission "{mission.title}" : {mission.application_count} {' '}
                                        
             {parseInt(mission.application_count, 10) > 1 ? 'candidatures':'candidature'}
                                         {/* --- Bouton PAR MISSION --- */}
                                         {/* Afficher le bouton seulement si la mission a potentiellement des candidatures (> 0) */}
             {mission.application_count > 0 && (
                                            
            <button onClick={() => handleToggleApplications(mission)}
             style={{ marginLeft: '15px', padding: '5px 10px', cursor: 'pointer' }}>
             {isExpanded ? 'Masquer candidatures' : `Voir candidatures (${mission.application_count})`} {/* Texte dynamique du bouton */}
             </button>
                                         )}
             </p>

                        {/* --- Affichage conditionnel de la liste des candidatures POUR CETTE MISSION --- */}
                         {/* Cette section s'affiche si cette mission spécifique est "dépliée" */}
            {isExpanded && (
             <div style={{ marginTop: '10px', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
              <h6>Candidatures pour cette mission :</h6>

                                             {/* Gérer les états de chargement/erreur pour les candidatures de cette mission */}
                {isLoadingApps ? (
                <p> Chargement des candidatures pour "{mission.title}"...</p>
                    ) : missionAppError ? (
                    <p style={{ color: 'red' }}>{missionAppError}</p>
                     ) : Array.isArray(appsForThisMission) && appsForThisMission.length > 0 ? (
                            // Si la liste des candidatures pour cette mission est chargée et non vide
                    <ul>
                                                     {/* Mapper sur les candidatures DE CETTE MISSION */}
                    {appsForThisMission.map(app => ( // Utilise 'app'
                    <li key={app.id_applications} style={{ fontSize: '0.9em', marginBottom: '5px' }}>
                     Postulé par <strong> {app.freelancer_name} </strong> - Statut : {app.application_status} {' '}
                                                             {/* Afficher un extrait du message et la date */}
                     Message : {app.message_content ? app.message_content.substring(0, 50) +
                     (app.message_content.length > 50 ? '...' : '') : 'Pas de message'} {' '}
                     Postulé le : {new Date(app.application_date).toLocaleDateString()}

                <div style={{ marginTop: '5px' }}>  
                     {app.application_status === 'pending' && !updatingApp && (
                     <>
                      <button onClick={()=>{ handleAcceptClick(app.id_applications)}} style={{ padding: '3px 8px', cursor: 'pointer',  backgroundColor: '#4CAF50', color: 'white',
                          border: 'none', borderRadius: '3px', marginRight: '5px' }}  >
                       Accepter
                     </button>

                     <button onClick={()=>{
                      handleRejectClick(app.id_applications)}
                     } style={{ padding: '3px 8px', cursor: 'pointer', backgroundColor: '#f44336', 
                     color: 'white', border: 'none', borderRadius: '3px' }} >
                    Rejeter
                    </button>

                     </>
                     )}
              </div>
                {updatingApp === app.id_applications && (
                  <span style={{ color: 'blue', marginLeft: '10px' }}>Mise à jour...</span>

                ) }
                {app.application_status!=='pending' && updatingApp !==app.id_applications &&(
                    <span style={{ fontWeight: 'bold', marginLeft: '10px', 
                        color: app.application_status === 'accepted' ? 'green' : 'red' }} >
                    
                   {app.application_status ==='accepted'? 'Accepté': 'Rejeté'}
                  

                        </span>
                ) }

                                                             {/* Liens optionnels vers mission/freelancer */}
                         <Link to={`/missions/${app.mission_id}`}>Mission</Link> |
                         <Link to={`/freelancers/${app.freelancer_id}`}>Candidat </Link> 
                        </li>
                       ))}
                     </ul>
                     ) : Array.isArray(appsForThisMission) && appsForThisMission.length === 0 ? (
                                                 // Si la liste pour cette mission est chargée et vide
                     <p> Aucune candidature trouvée pour cette mission.</p>
                     ) : (
                                                 // État initial avant le fetch ou si l'état n'est pas un tableau valide
                          null
                      )}
                    </div>
                      )} {/* Fin de l'affichage conditionnel de la liste par mission */}

                                 </li>
                             ); // Fin du return du map principal
                         } )} {/* Fin du map sur missionWithCount */}
                     </ul>
                 ) : ( // Si missionWithCount n'est pas un tableau OU est un tableau vide (pas de missions avec candidatures initialement)
                     <p> Vous n'avez pas encore de missions avec des candidatures à afficher ici.</p> // Message si la première liste est vide
                 )}

                 {updateError && !updatingApp && (
                    <p style={{color: 'red', marginTop: '15px'}} > {updateError}   </p>
                 )}
                 {/* L'ancienne section "Voir toutes les candidatures" est commentée */}

                 {/* Texte placeholder générique */}
                <p style={{ marginTop: '20px' }}> Ajoutez ici d'autres informations ou liens pour le client.</p>

            </div>
        );
    }

    // Cas de repli si les données initiales ne sont pas chargées
    return <p> Préparation du Tableau de bord client...</p>;

} // Fin du composant
