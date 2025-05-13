import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Si vous avez l'intention d'utiliser <Link> plus tard, importez-le
// import { Link } from 'react-router-dom';

export default function ClientDashboard({user, token} ){ // Reçoit user et token en tant que props

    // --- États pour les métriques spécifiques au client (comptes) ---
    const[clientStat, setClientStat] = useState(null); // Pour les comptes (publiées, acceptées)
    // La première liste des missions QUI ONT des candidatures, avec leur compte total de candidatures
    const[missionWithCount, setMissionWithCount] = useState(null);

    // États pour gérer le chargement et les erreurs des métriques initiales (comptes + première liste)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // --- États pour gérer l'affichage et les données des candidatures PAR MISSION ---
    // État pour savoir quelle mission est "dépliée"
    const [expandedMissions, setExpandedMissions] = useState({});
    // État pour stocker les listes de candidatures chargées, indexées par l'ID de mission
    const [applicationsByMission, setApplicationsByMission] = useState({});
    // États de chargement et d'erreur spécifiques aux appels de chaque liste de candidatures par mission
    const [loadingMissionApps, setLoadingMissionApps] = useState({});
    const [missionAppsError, setMissionAppsError] = useState({});

    // --- États pour gérer la MISE À JOUR du statut d'une candidature ---
    // Stocke l'ID de la candidature en cours de mise à jour (pour désactiver les boutons)
    // Respecte le nom de variable choisi par l'utilisateur
    const [updatingApp, setUpdatingApp] = useState(null); // <-- Variable name used by user
    // Stocke un message d'erreur si la dernière mise à jour a échoué
    // --- CORRECTION : Assurer que le setter a le bon nom ---
    const [updateError, setUpdateError] = useState(null); // <-- Ensure setter name is correct


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
                 axios.get('http://localhost:5000/api/missions/count/published-by-client', { headers: { 'Authorization': `Bearer ${token}` } }),
                 axios.get('http://localhost:5000/api/missions/count/accepted-by-client', { headers: { 'Authorization': `Bearer ${token}` } }),
                 axios.get('http://localhost:5000/api/missions/count/mission-has-application', { headers: { 'Authorization': `Bearer ${token}` } }),
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
            const response = await axios.get(`http://localhost:5000/api/applications/by-mission/${missionIdToFetch}`, {
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

        // --- CORRECTION : Typo dans le nom du setter ---
        setUpdateError(null); // <-- Utilisez setUpdateError

        // Empêche de lancer plusieurs mises à jour en même temps pour la même candidature ou si une autre est en cours
        // Utilise la variable d'état avec le nom choisi par l'utilisateur
       if(updatingApp){ // <-- Variable name used by user
           console.warn(`Another application (${updatingApp}) is already being updated.`);
           // Optionnel: Afficher un message à l'utilisateur "Une autre mise à jour est en cours"
           return; // Sort de la fonction si une mise à jour est déjà en cours
       }

        // Indique que cette candidature est en cours de mise à jour
        // Utilise la variable d'état avec le nom choisi par l'utilisateur
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
            const response = await axios.put(`http://localhost:5000/api/applications/${applicationId}/status`,
                // --- Utilise la variable newStatus reçue en argument ---
                { status: newStatus }, // <-- Envoie le nouveau statut reçu
                {
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                }
            );

            console.log(`Status updated successfully for application ${applicationId}:`, response.data);
            // response.data devrait contenir la candidature mise à jour (y compris le nouveau statut)

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
            // --- CORRECTION : Typo dans le nom du setter ---
            setUpdateError(`Échec de la mise à jour du statut (ID: ${applicationId}): ${errorMessage}`); // <-- Utilisez setUpdateError

            // Gérer les erreurs 401/403 (si le token expire pendant l'opération)
             if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem('token');
                // navigate('/login'); // Si navigate dispo
             }

        } finally {
            // Termine l'état de mise à jour, même en cas d'erreur
            setUpdatingApp(null); // <-- Utilise le setter correspondant
            // Optionnel : Masquer le message d'erreur après un délai
            // setTimeout(() => setUpdateError(null), 5000);
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


    // --- Logique de Rendu ---

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
                                                     {/* Mapper sur les candidatures DE CETTE MISSION pour les afficher individuellement */}
                                                     {appsForThisMission.map(app => (
                                                         // Utilise la variable d'état avec le nom choisi par l'utilisateur dans les conditions
                                                         <li key={app.id_applications} style={{ fontSize: '0.9em', marginBottom: '5px', padding: '5px', borderBottom: '1px dotted #ddd' }}>
                                                             {/* Détails de la candidature */}
                                                             <p>
                                                                 Postulé par <strong> {app.freelancer_name} </strong> - Statut : **{app.application_status}** {/* Affiche le statut actuel */}
                                                             </p>
                                                             <p style={{ fontSize: '0.9em', color: '#555' }}>
                                                                  Message : {app.message_content ? app.message_content.substring(0, 100) + (app.message_content.length > 100 ? '...' : '') : 'Pas de message'}
                                                                  (Postulé le : {new Date(app.application_date).toLocaleDateString()})
                                                             </p>

                                                             {/* --- Boutons Accepter/Rejeter et indicateur de mise à jour --- */}
                                                             <div style={{ marginTop: '5px' }}>
                                                                 {/* Afficher les boutons seulement si le statut est "pending" ET qu'aucune candidature n'est en cours de mise à jour */}
                                                                 {/* Utilise la variable d'état avec le nom choisi par l'utilisateur */}
                                                                 {app.application_status === 'pending' && !updatingApp && ( // <-- Variable name used by user
                                                                     <> {/* Fragment pour regrouper les boutons */}
                                                                          <button onClick={() => handleAcceptClick(app.id_applications)}
                                                                                  style={{ padding: '3px 8px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', marginRight: '5px' }}>
                                                                              Accepter
                                                                          </button>
                                                                          <button onClick={() => handleRejectClick(app.id_applications)}
                                                                                  style={{ padding: '3px 8px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px' }}>
                                                                              Rejeter
                                                                          </button>
                                                                     </>
                                                                 )}

                                                                 {/* Afficher un message si cette candidature spécifique est en cours de mise à jour */}
                                                                 {/* Utilise la variable d'état avec le nom choisi par l'utilisateur */}
                                                                 {updatingApp === app.id_applications && ( // <-- Variable name used by user
                                                                      <span style={{ color: 'blue', marginLeft: '10px' }}>Mise à jour...</span>
                                                                 )}

                                                                  {/* Afficher le statut final s'il n'est plus pending */}
                                                                  {/* Utilise la variable d'état avec le nom choisi par l'utilisateur */}
                                                                  {app.application_status !== 'pending' && updatingApp !==app.id_applications && ( // <-- Variable name used by user
                                                                       <span style={{ fontWeight: 'bold', marginLeft: '10px', color: app.application_status === 'accepted' ? 'green' : 'red' }}>
                                                                           {app.application_status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                                                                       </span>
                                                                  )}

                                                             </div>

                                                              {/* Liens optionnels vers mission/freelancer (noté pour plus tard) */}
                                                             {/* Exemple: <Link to={`/missions/${app.mission_id}`}>Mission</Link> | <Link to={`/freelancers/${app.freelancer_id}`}>Freelancer</Link> */}
                                                         </li>
                                                     ))}
                                                 </ul>
                                             ) : Array.isArray(appsForThisMission) && appsForThisMission.length === 0 ? (
                                                 <p> Aucune candidature trouvée pour cette mission.</p>
                                             ) : (
                                                 null
                                             )}
                                         </div>
                                     )} {/* Fin de l'affichage conditionnel de la liste par mission */}

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
