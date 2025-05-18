import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default function ClientDashboard({user, token} ){ 

    // --- États pour les métriques spécifiques au client (comptes) ---
    const[clientStat, setClientStat] = useState(null); // Pour les comptes (publiées, acceptées)
    const[missionWithCount, setMissionWithCount] = useState(null);

    // États pour gérer le chargement et les erreurs des métriques initiales (comptes + première liste)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // --- États pour gérer l'affichage et les données des candidatures PAR MISSION ---
    const [expandedMissions, setExpandedMissions] = useState({});
    const [applicationsByMission, setApplicationsByMission] = useState({});
    const [loadingMissionApps, setLoadingMissionApps] = useState({});
    const [missionAppsError, setMissionAppsError] = useState({});

    // --- États pour gérer la MISE À JOUR du statut d'une candidature ---
    const [updatingApp, setUpdatingApp] = useState({}); 
    const [updateError, setUpdateError] = useState(null); 


   // --- useEffect pour récupérer les métriques initiales et la première liste ---
   useEffect(()=>{
    const fetchInitialClientData = async () =>{ // Fonction pour fetch les données initiales
        setLoading(true);
        setError(null);

        if(!user || !token ){
            setError('Informations utilisateur manquantes pour charger le tableau de bord client.');
            setLoading(false);
            return;
        }

        try{
            const [publishedCountReponse, acceptedCountReponse, missionHasApplicationResponse] = await Promise.all([
                 axios.get('/api/missions/count/published-by-client', { headers: { 'Authorization': `Bearer ${token}` } }),
                 axios.get('/api/missions/count/accepted-by-client', { headers: { 'Authorization': `Bearer ${token}` } }),
                 axios.get('/api/missions/count/mission-has-application', { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            setClientStat({
                publishedCount: publishedCountReponse.data.count,
                acceptedCount: acceptedCountReponse.data.count
            });

            setMissionWithCount(missionHasApplicationResponse.data);

        } catch (err) {
            console.error('Erreur lors du chargement initial des données client:', err);
            setError('Impossible de charger les données initiales du tableau de bord client : ' +
                (err.response?.data?.error || err.message));

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


    // --- Fonction pour récupérer les candidatures pour UNE mission spécifique ---
    const fetchApplicationsForMission = async (missionIdToFetch, currentToken) => {
        console.log(`Workspaceing applications for mission ID: ${missionIdToFetch}`);
        if (!missionIdToFetch || !currentToken) {
              console.warn('Cannot fetch applications: missing missionId or token.');
              setMissionAppsError(prev => ({ ...prev, [missionIdToFetch]: 'ID de mission manquant pour charger les candidatures.' }));
              setLoadingMissionApps(prev => ({ ...prev, [missionIdToFetch]: false }));
              return;
         }

        setLoadingMissionApps(prev => ({ ...prev, [missionIdToFetch]: true }));
        setMissionAppsError(prev => ({ ...prev, [missionIdToFetch]: null }));

        try {
            const response = await axios.get(`/api/applications/by-mission/${missionIdToFetch}`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });

            setApplicationsByMission( prev =>({
                ...prev,
                [missionIdToFetch]: response.data
            }));
            console.log(`Applications loaded for mission ${missionIdToFetch}: ${response.data.length} items.`);


        } catch (err) {
            console.error(`Erreur lors du chargement des candidatures pour la mission ${missionIdToFetch}:`, err);
            const errorMessage = err.response?.data?.error || err.message || 'Erreur lors du chargement des candidatures.';
            setMissionAppsError(prev => ({ ...prev, [missionIdToFetch]: errorMessage }));

            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem('token');
                // navigate('/login'); // Si navigate dispo
             }

        } finally {
            setLoadingMissionApps(prev => ({ ...prev, [missionIdToFetch]: false }));
        }
    };


    // --- Fonction pour gérer le clic sur le bouton "Voir candidatures" par mission ---
    const handleToggleApplications = (mission) => {
        const missionIdToToggle = mission.id_missions;
        const isCurrentlyExpanded = !!expandedMissions[missionIdToToggle];
        console.log(`Toggling applications visibility for mission ID: ${missionIdToToggle}. Currently expanded: ${isCurrentlyExpanded} `);

        // 1. Inverse l'état "déplié"
        setExpandedMissions(prev=>({
            ...prev,
            [missionIdToToggle]:  !isCurrentlyExpanded
        }));

        // 2. Déclenche le fetch UNIQUEMENT si on déplie ET que les données ne sont PAS ENCORE chargées
        if (!isCurrentlyExpanded && !applicationsByMission[missionIdToToggle] && token && mission.application_count > 0) {
             console.log(`Mission ${missionIdToToggle} is being expanded and apps not loaded, initiating fetch.`);
             fetchApplicationsForMission(missionIdToToggle, token);
        }
    };

    // --- Fonction pour gérer la MISE À JOUR du statut d'une candidature ---
    // Respecte le nom de variable choisi par l'utilisateur
    const handleUpdateAppStatus = async(applicationId, newStatus) =>{
        console.log(`Attempting to update status for application ${applicationId} to ${newStatus}`);
        console.log("Valeur reçue pour newStatus:", newStatus); // <-- Log pour vérifier la valeur reçue

       
        setUpdateError(null); // <-- Utilisez setUpdateError

       if(updatingApp){ // <-- Variable name used by user
           console.warn(`Another application (${updatingApp}) is already being updated.`);

           return; 
       }

    
        setUpdatingApp(applicationId); // <-- Utilise le setter correspondant

        const currentToken = token; // Récupère le token

        // Vérification basique (bien que déjà gérée par le backend)
        if (!applicationId || !newStatus || !currentToken) {
            console.error('Missing info for status update:', { applicationId, newStatus, currentToken });
            // --- CORRECTION : Typo dans le nom du setter ---
            setUpdateError('Impossible de mettre à jour le statut : informations manquantes.'); // <-- Utilisez setUpdateError
            // Termine l'état de mise à jour
            setUpdatingApp(null); // <-- Utilise le setter correspondant
            return;
        }

        try {
            // --- Appel API : PUT pour mettre à jour le statut ---
            const response = await axios.put(`/api/applications/${applicationId}/status`,
                // --- Utilise la variable newStatus reçue en argument ---
                { status: newStatus }, // <-- Envoie le nouveau statut reçu
                {
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                }
            );

            console.log(`Status updated successfully for application ${applicationId}:`, response.data);
            

            // --- Mise à jour de l'État Frontend : Refléter le nouveau statut localement ---
            setApplicationsByMission(prev => {
                const updatedState = { ...prev };

                for (const missionId in updatedState) {
                    const appIndex = updatedState[missionId].findIndex(app => app.id_applications === applicationId);

                    if (appIndex !== -1) {
                        updatedState[missionId][appIndex] = response.data; // Remplace par l'objet mis à jour
                        console.log(`Frontend state updated for application ${applicationId} in mission ${missionId}.`);
                        break; // Sort de la boucle une fois la candidature trouvée et mise à jour
                    }
                }
                return updatedState; // Retourne le nouvel état
            });

            // Optionnel : Afficher un message de succès temporaire (non implémenté ici pour garder la simplicité)

        } catch (err) {
            console.error(`Erreur lors de la mise à jour du statut de la candidature ${applicationId}:`, err);
            const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la mise à jour du statut.';
            
            setUpdateError(`Échec de la mise à jour du statut (ID: ${applicationId}): ${errorMessage}`); // <-- Utilisez setUpdateError

            // Gérer les erreurs 401/403 (si le token expire pendant l'opération)
             if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem('token');
                // navigate('/login'); // Si navigate dispo
             }

        } finally {
            // Termine l'état de mise à jour, même en cas d'erreur
            setUpdatingApp(null); // <-- Utilise le setter correspondant
            
        }
    };

    // Handlers spécifiques pour les clics sur Accepter/Rejeter (appellent la fonction générique)
    const handleAcceptClick = (applicationId) => {
        console.log(`Accept button clicked for application ID: ${applicationId}`); // <-- Log de clic bouton
        handleUpdateAppStatus(applicationId, 'accepted'); // <-- Appelle avec le statut 'accepted'
    };

    const handleRejectClick = (applicationId) => {
        console.log(`Reject button clicked for application ID: ${applicationId}`); // <-- Log de clic bouton
        handleUpdateAppStatus(applicationId, 'rejected'); // <-- Appelle avec le statut 'rejected'
    };



    // Affichage chargement initial / erreur initiale
    if(loading){ return <p> Chargement initial du tableau de bord client...</p> }
    if(error){ return <p style={{color: 'red'}} > {error} </p> }

    // Rendu principal si les données initiales sont chargées
    if(clientStat){
        return(
            <div className="client-dash-container">
                <h3> Tableau de bord Client : </h3>

                {/* --- Section des Métriques (Comptes) --- */}
                <p> Nombre de missions publiées : {' '}
                     {clientStat?.publishedCount !== undefined ? clientStat.publishedCount  : 'N/A' }
                 </p>
                <p> Nombre de missions acceptées : {' '}
                     {clientStat?.acceptedCount !== undefined ? clientStat.acceptedCount  : 'N/A' }
                 </p>

                 {/* --- Section "Missions avec candidatures" (la première liste mappée, avec les boutons et listes par mission) --- */}
                 <h4> Missions avec candidatures : </h4>

                 {Array.isArray(missionWithCount) && missionWithCount.length > 0 ? (
                    <ul>
                        {/* --- Mapper sur la première liste des missions avec candidatures --- */}
                        {missionWithCount.map( mission => {
                             const missionId = mission.id_missions;
                             const isExpanded = !!expandedMissions[missionId];
                             const appsForThisMission = applicationsByMission[missionId];
                             const isLoadingApps = !! loadingMissionApps[missionId];
                             const missionAppError = missionAppsError[missionId];

                             return (
                                 <li key={missionId} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
                                     {/* Infos de base de la mission + le bouton déplier/replier */}
                                     <p>
                                         Mission "{mission.title}" : {mission.application_count} {' '}
                                         {parseInt(mission.application_count, 10) > 1 ? 'candidatures':'candidature'}
                                         {mission.application_count > 0 && (
                                             <button onClick={() => handleToggleApplications(mission)}
                                                     style={{ marginLeft: '15px', padding: '5px 10px', cursor: 'pointer' }}>
                                                 {isExpanded ? 'Masquer candidatures' : `Voir candidatures (${mission.application_count})`}
                                             </button>
                                         )}
                                     </p>

     {/* --- Affichage conditionnel de la liste des candidatures POUR CETTE MISSION --- */}
                    {isExpanded && (
                <div>
                    {isLoadingApps && <p>Chargement des candidatures...</p>}
                    {updateError && <p >{updateError}</p>}
                    
                 {appsForThisMission && appsForThisMission.length>0 ? (
                    <ul>
                        {appsForThisMission.map(app =>(
                            <li key={app.id_applications} >
                                <p>Nom: {' '} {app.freelancer_name} </p>
                                <p> Email: {' '} {app.freelancer_email} </p>
                                <p> Status: {' '} {app.application_status} </p>
                            <p> Message : {app.message_content ? app.message_content.substring(0, 100) + 
                                (app.message_content.length > 100 ? '...' : '') : 'Pas de message'} {' '}
                                 (Postulé le : {new Date(app.application_date).toLocaleDateString()})
                             </p>

                              {/* Boutons de mise à jour de statut */}

                                <div>
                                 <button
                                 onClick={() => handleAcceptClick(app.id_applications)}
                                 disabled={updatingApp === app.id_applications}
                                
                                >
                                 Accepter
                              </button>
                              <button
                               onClick={() => handleRejectClick(app.id_applications)}
                               disabled={updatingApp === app.id_applications}
                              >
                              Rejeter
                             </button>

                                        
                                </div>
                            </li>
                        ) )}
                    </ul>
                 ): !isLoadingApps?(
                    <p>Aucune candidature à afficher.</p>

                 ): null }   


                </div>
                    )}
                                     
                                      {/* Fin de l'affichage conditionnel de la liste par mission */}

                                 </li>
                             );
                         } )}
                     </ul>
                 ) : ( // Si missionWithCount est vide
                     <p> Vous n'avez pas encore de missions avec des candidatures à afficher ici.</p>
                 )}

                 {/* --- Affichage de l'erreur globale de mise à jour (si elle existe et aucune mise à jour n'est en cours) --- */}
                 {/* Utilise la variable d'état avec le nom choisi par l'utilisateur */}
                 {updateError && !updatingApp && ( // <-- Variable name used by user
                     <p style={{color: 'red', marginTop: '15px'}}>{updateError}</p>
                 )}


                 {/* Texte placeholder générique */}
                  <p style={{ marginTop: '20px' }}> Ajoutez ici d'autres informations ou liens pour le client.</p>

            </div>
        );
    }

    // Cas de repli si les données initiales ne sont pas chargées
    return <p> Préparation du Tableau de bord client...</p>;

} // Fin du composant
