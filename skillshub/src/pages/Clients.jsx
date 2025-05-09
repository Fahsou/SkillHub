import React, {useState, useEffect} from "react";
import axios from 'axios';

export default function Clients(){
 const [clients, setClients] = useState([]); //etat pour stocker les freelancers
 const [loading, setLoading] = useState(true); //etat pour gestion de chargement
 const [error, setError] = useState(null); // etat pour gestion d'erreur

 //utiliser useEffect pour recuperer les utilisateurs
 useEffect(()=>{

    const fetchClients = async ()=>{
        try{
            const reponse = await axios.get('http://localhost:5000/api/users',{
                params: {
                    role: 'client' //ajoute le parametre role?=freelance a l'URL
                }
            });

            console.log('Reponse API clients', reponse);
            console.log('Liste des clients', reponse.data);

            setClients(reponse.data);

        }catch(err) {
            console.error('Erreur lors de la recuperation des clients:', err);
            setError('Impossible de charger la liste des clients ' + (err.reponse?.data?.error || err.message));
        } finally{
            setLoading(false);
        }
    };

    fetchClients();
 }, []);
  
 if(loading){
    return <p> Chargement des freelancers... </p>
 }

 if (error){
    return <p style={{color: 'red'}}> {error} </p>
 }


return(
    <div className="clients-container">
        <h2> Liste des clients </h2>
        {clients.length>0? (
            <div className="clients-list">
                {clients.map(client =>(
                    <div key={client.id_users} className="clients-item"> 
                     <h3>{client.name} </h3>
                     <p>{client.email} </p>

                    </div>
                ) )}
            </div>
        ):(
            <p>Aucun client trouve pour le moment </p>
        )};

    </div>
)

}