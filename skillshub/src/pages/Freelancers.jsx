import React, {useState, useEffect} from "react";
import axios from 'axios';

export default function Freelancers(){
 const [freelancers, setFreelancers] = useState([]); //etat pour stocker les freelancers
 const [loading, setLoading] = useState(true); //etat pour gestion de chargement
 const [error, setError] = useState(null); // etat pour gestion d'erreur

 //utiliser useEffect pour recuperer les utilisateurs
 useEffect(()=>{

    const fetchFreelancers = async ()=>{
        try{
            const reponse = await axios.get('/api/users',{
                params: {
                    role: 'freelance' //ajoute le parametre role?=freelance a l'URL
                }
            });

            console.log('Reponse API freelancers', reponse);
            console.log('Liste des freelances', reponse.data);

            setFreelancers(reponse.data);

        }catch(err) {
            console.error('Erreur lors de la recuperation des freelancers:', err);
            setError('Impossible de charger la liste des freelancers ' + (err.reponse?.data?.error || err.message));
        } finally{
            setLoading(false);
        }
    };

    fetchFreelancers();
 }, []);
  
 if(loading){
    return <p> Chargement des freelancers... </p>
 }

 if (error){
    return <p style={{color: 'red'}}> {error} </p>
 }


return(
    <div className="freelancers-container">
        <h2> Liste des freelancers </h2>
        {freelancers.length>0? (
            <div className="freelancers-list">
                {freelancers.map(freelancer =>(
                    <div key={freelancer.id_users} className="freelancers-item"> 
                     <h3>{freelancer.name} </h3>
                     <p>{freelancer.email} </p>

                    </div>
                ) )}
            </div>
        ):(
            <p>Aucun freelancer trouve pour le moment </p>
        )};

    </div>
)

}