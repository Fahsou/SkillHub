import React, {useState, useEffect} from "react";
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";

export default function ApplyForMissions(){
 
    const {missionId} = useParams(); //recupere l'ID mission depuis le parametre de l'URL
    const navigate = useNavigate();

    //etat pour les donnees de formulaire
    const [messageContent, setMessageContent] = useState('');
    const [cvFile, setCvFile] = useState(null);

    //gestion: envoi, succes, erreur
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    //Je veux afficher le titre du poste
    const [missionDetails, setMissionDetails]= useState(null);
    const [loading, setLoading] = useState(true);

    //gestion des missions a afficher 
    useEffect( () =>{
       const fetchMissionsDetails = async() =>{

        try{
        const reponse = await axios.get(`http://localhost:5000/api/missions/${missionId}`)
        setMissionDetails(reponse.data);
       
        }catch(err) {
            console.error('Erreur chargement détails mission sur page candidature', err);
            setError('Impossible d\'afficher les détails de la mission');

        }finally{
            setLoading(false);
        }

       };

       if(missionDetails) fetchMissionsDetails();

    }, [missionId]); //re execute si l'ID de l'URL change

   //gestion changement de message
   const handleMessageChange = (e) =>{
        setMessageContent(e.target.value);
   }

   //gestion selection de fichier CV
   const handleFileChange = (e) =>{
      setCvFile(e.target.files? e.target.files[0]: null );
   }

   //gestion soumission de formulaire complet
   const handleSubmit = async (e)=>{
        e.preventDefault(); // empeche le rechargement de page

        //reinitialisation message
        setError(null);
        setSuccess(null);
        setSubmitting(true);

        const token = localStorage.getItem('token');

        //verification de token et utilisateur est freelance
        if(!token){
            setError('Connectez-vous pour postuler');
            setSubmitting(false);
            return;
        }

        //preparation des donnees a envoyer
        const applicationData ={
            mission_Id: missionId, //recuperation URL
            message_content: messageContent,
            //----------Gestion de CV---------------//
        }

        try{
             //---------------Appel API pour envoyer la candidature--------------//
            //----------Le backend sécurisé s'attend à recevoir mission_id et message_content en JSON---------//
            const reponse = await axios.post('http://localhost:5000/api/applications', applicationData,
                {
                    header:{
                        'Content-Type': 'application/json', //indique qu'on envoi du json
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Candidature envoyee avec succes: ', reponse.data);
            setSuccess('Votre candidature est envoyee avec success');
            //reinitialiser le formulaire
            setMessageContent('');
            setCvFile(null);
            navigate('/profile');


        }catch (err){
            console.error('Erreur lors de la soumission de candidature', err);
            setError('Echec de la soumission de candidature: ', + err.reponse?.data?.error || err.message);

        }finally{
            setSubmitting(false);
        }
    };

   //verifie ID mission 
    if(!missionId){
        return <p style={{color: 'red'}} > Erreur : ID de mission manquant pour la candidature </p>
   }


    return(
        <div className="apply-form-container">
         {missionDetails && <h2> Postuler a: {missionDetails.title}  </h2>}

         <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="messageContent" > Votre message: </label>
                <textarea id="messageContent"
                 value ={messageContent}
                 onChange={handleMessageChange}
                 />
             </div>

             <div>
                <label htmlFor="cvFile" > Uploader votre CV (format PDF, DOCX, DOC) </label>
                <input
                 type="file"
                 id="cvFile"
                 onChange={handleFileChange}
                />
                {cvFile && <p> Fichier selectionne: {cvFile.name} </p>}

             </div>
             <button type="submit" disabled={submitting} > </button>
             {submitting?'Envoi en cours ': 'Soumettre la candidature '};
            
         </form>

         {/*-------Affichage de message d'erreur */}
         {success && <p style={{ color: 'green' }}>{success}</p>}
         {error && <p style={{ color: 'red' }}>{error}</p>}


        </div>
    )
}