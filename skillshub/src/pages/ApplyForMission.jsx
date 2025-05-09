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
    const [missionDetail, setMissionDetail]= useState(null);

    //gestion des missions a afficher 
    useEffect( () =>{
       const fetchMissionsDetails = async() =>{

        const reponse = await axios.get('http://localhost:5000/')
       }

    })

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

        </div>
    )
}