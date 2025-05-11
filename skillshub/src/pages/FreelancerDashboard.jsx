import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FreelancerDashboard({user, token} ){ //user et token en props
 //stocker les metriques freelancer
 const [freelanceStat, setFreelanceStat] = useState(null);

 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 //Effet pour récupérer les métriques spécifiques au freelancer
 // Se déclenche lorsque le composant est monté ou si user/token changent

 useEffect( ()=>{
    const fetchFreelanceMetrics = async () =>{
        setLoading(true);
        setError(null);

        // S'assurer que l'ID utilisateur et le token sont disponibles avant d'appler API
        if(!user || !token){
            setError('Informations utilisateur manquantes pour charger le tableau de bord freelancer');
            setLoading(false);
            return;
        }

        try{
            //nombre de missions postule
            const appliedCountResponse = await axios.get('http://localhost:5000/api/applications/count/by-freelancer',
                {
                    headers:{
                        'Authorization': `Bearer ${token}`
                    }
                });
            // Met à jour l'état avec les données récupérées
            setFreelanceStat({
                appliedCount: appliedCountResponse.data.count,
            });
        }catch(err){
            console.error('Erreur lors du chargement des métriques freelancer:', err);
            setError('Impossible de charger les données du tableau de bord freelancer : ' 
                +(err.response?.data?.error || err.message ));

        }finally{
            setLoading(false);
        }
    };

    fetchFreelanceMetrics();
}, [user, token ] ); 

if(loading){
    return <p> Chargement... </p>
}

if(error){
    return <p style={{color: 'red'}} >{error} </p>
}

if(!freelanceStat){
    return <p> Aucune donnee freelancer a afficher </p>
}

    return(
        <div className="freelancer-dashboard">
            <h3> Tableau de bord  </h3>
            <p> Nombre de missions postule: {' '}
                 {freelanceStat.appliedCount !== undefined? freelanceStat.appliedCount: 'N/A' } </p>
        </div>
    );
}