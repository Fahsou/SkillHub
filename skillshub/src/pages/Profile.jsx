import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

export default function Profile(){

    const [ user, setUser] = useState(null);
    const [ error, setError] = useState("");
    
    useEffect(()=>{
    

    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if(!storedUser || !token){
        setError("Veuillez vous connecter");
        return;
    }


    const fetchProfile = async () =>{
        try{
            const reponse = await fetch('http://localhost:5000/api/users/profile',{
                method: 'GET',
                headers:{
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!reponse.ok){
                throw new Error('Erreur lors de la recuperation du profil');
            }
            
            const data = await reponse.json();
            setUser(data.user);


        }catch(err){
            console.error(err);
            setError('Impossible de charger le profil');
        }
    
    
    };

    fetchProfile();
    

    if(!storedUser){
        return <p> Chargement...</p>
    }


    }, [] );

    if(error){
        return <h2>{error} </h2>
    }

    if(!user){
        return <h2> Chargement de profil </h2>
    }

    return (
    <div>
        <h2>Mon profil</h2>
        <p><strong>Nom:</strong> {user.name} </p>
        <p><strong>Email:</strong> {user.email} </p>
        <p><strong>Role:</strong> {user.role} </p>

        <Link to="/dashboard" >
         <button> Voir mon tableau de bord </button>
        </Link>

    </div>
    )
}