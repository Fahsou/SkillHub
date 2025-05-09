import React, {useState, useEffect} from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";

export default function MissionDetails(){

    const {missionId} = useParams();  //missionId doit etre egale au route dans App.js

    //etat pour stocker les details de mission
    const [mission, setMission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=>{
        const fetchMissionsDetails = async () =>{
            try{
                
            setMission(null);
            setError(null);
            setLoading(true);

            //utilisation de param de l'URL dans l'API get
            const reponse = await axios.get(`http://localhost:5000/api/missions/${missionId}`);
            console.log(`Details de la mission ${missionId}`, reponse.data);
            
            setMission(reponse.data); //met a jour l'etat avec les details de la mission recu

            } catch(err) {
                console.error(`Erreur lors de la recuperation de la mission ${missionId}`, err);

                if(err.reponse && err.reponse.status === 404 ){
                    setError('Mission non trouve');
                }else{
                    setError('Impossible de charger les details de la mission');
                }
            } finally{
                setLoading(false);
            }
        };
        // S'assurer que missionId existe avant de faire l'appel API
        if(missionId){
            fetchMissionsDetails();
        }else{
            setError('ID mission manquant dans l\'URL.');
            setLoading(false);
        }

    }, [missionId]); //re execute si l'URL change

    // ---Logique de rendu conditionnel------
    if(loading){
        return <p> Chargement des details de la mission </p>;
    }

    if(error){
        return <p style={{color: 'red'}} > {error} </p>;
    }

    if(!mission){
        return <p> Aucune information de mission a afficher </p>
    }

 return(
    <div className="missionDetail-container">
        <h2> {mission.title} </h2>
        <p> <strong>Description: </strong> {mission.description} </p>
        {mission.created_at && (
            <p> <strong> Cree le: </strong> {new Date(mission.created_at).toLocaleDateString()} </p>
        ) }
        {mission.client_id && (
            <p><strong>ID Client:</strong> {mission.client_id}</p>
        )}

   <button>Postuler</button>
    </div>
 )
}