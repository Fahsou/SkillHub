import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


// --- Importez les composants spécifiques aux rôles ---//
import ClientDashboard from './ClientDashboard';
import FreelancerDashboard from './FreelancerDashboard';

export default function Dashboard(){

 const navigate = useNavigate();
// État pour stocker les informations de l'utilisateur connecté
 const [user, setUser] = useState(null);
 const [token, setToken] = useState(null); //utile pour le passer aux composants enfants pour leurs appels API



 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

// --- useEffect pour récupérer le profil de l'utilisateur authentifié ---//
 useEffect(() =>{
   const fetchUserProfil = async() =>{
    
    const storedToken = localStorage.getItem('token');
    
    if(!storedToken){
        setError('Vous devez être connecté pour accéder au tableau de bord');
        setLoading(false);
        navigate('/login');
        return; //stop cette execution
    }

    setToken(storedToken); // Si token trouve

    try{
        const reponse = await axios.get('http://localhost:5000/api/users/profile', 
            {
                headers: {'Authorization': `Bearer ${token}` } // Envoie le token dans l'en-tête d'autorisation
            }
        );
        console.log('Profil utilisateur chargé avec succès:', reponse.data);
        setUser(reponse.data.user);

    }catch (err) {
        console.error('Erreur lors du chargement du profil utilisateur: ', err);
        setError('Impossible de charger votre profil. Veuillez réessayer : ' 
        + (err.response?.data?.error || err.message));

       // token expiré - statut 401/403
         if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('token'); 
           }
      }finally{
        setLoading(false);
      }
  }

  fetchUserProfil();
 
  }, []);

   if(error){
    return <p style={{color: 'red'}} > {error}  </p>
   }   

   if(loading){
    return <p> Chargement... </p>
   }
   
   if(user && token){
    return (
        <div className="dashboard-wraper">
            <h2> Bienvenue {user.name} </h2>
            <p> Vous etes un {user.role} </p>
        
        {/* --- Rendu Conditionnel du Tableau de Bord Spécifique au Rôle --- */}
        {user.role === 'client' && <ClientDashboard user={user} token={token} />}
        {user.role === 'client' && <FreelancerDashboard user={user} token={token} />}

        {!['client', 'freelance'].includes(user.role) && (
                     <p>Votre rôle utilisateur ({user.role}) n'est pas configuré pour un tableau de bord spécifique pour l'instant.</p>
         )} {/*Plus de securite */}


        </div>

       );
    }
 return <p>Préparation du tableau de bord...</p>;
}