import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';

export default function Profile(){
    
    const navigate= useNavigate();

    const [ profile, setProfile] = useState(null);
    const [ error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
    

    const storedUser = localStorage.getItem('user');
    
    
   /* if(!storedUser || !token){
        setError("Veuillez vous connecter");
        return;
    }*/


    const fetchProfile = async () =>{


        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        if(!token){
            setError('Vous devez être connecté pour voir votre profil.');
            setLoading(false);
            navigate('/login');
            return;
        }

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
            setProfile(data.user);


        }catch(err){
            console.error('Error fetching profile' ,err);
            setError('Impossible de charger le profil: ' + (err.response?.data?.error || err.message));

            if(err.response && (err.response.status === 401 || err.response.status === 403)){
                localStorage.removeItem('token');
                navigate('/login');
            }
        }finally{
            setLoading(false);
        }
    
    
    };

    fetchProfile();
    

    if(!storedUser){
        return <p> Chargement...</p>
    }
  
  }, [navigate] );

  //---------------Logout-------------------//
 const handleLogout = () =>{
    console.log('Logout initiated from Profile page...');

    //1 Supprimer le token
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');

    //Redirection vers login
    navigate('/login');
    console.log('Redirection vers /login');
 }

  if(loading){
    return <h2> Chargement de profil </h2>
 }

    if(error){
        return <p style ={{color: 'red'}}>{error} </p>
    }

    return (
     <div className='profile-container'>
        <h2>Mon profil</h2>
    {profile?
       (<div>
          <p><strong>Nom:</strong> {profile.name} </p>
          <p><strong>Email:</strong> {profile.email} </p>
          <p><strong>Role:</strong> {profile.role} </p>
        </div> ):(
            <p> Details du profil non dispo </p>
        )};

        <Link to="/dashboard" >
         <button> Voir mon tableau de bord </button>
        </Link>

        <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 15px',
         cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }} >
            Deconnexion
        </button>

    </div>
    );
}