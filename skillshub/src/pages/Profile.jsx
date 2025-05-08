import React, {useState, useEffect} from 'react';

export default function Profile(){

    const [user, setUser] = useState(null);
    
    useEffect(()=>{
    //recupere l'utilisateur depuis localstorage si stocke apres le login

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = storedUser?.token;

    fetch('http://localhost:5000/api/users/profile',
        {
            headers:{ Authorization: token,},
        }
    )

    .then((res)=> res.json)
    .then((data)=> setUser(data))
    .catch((err)=>console.error('erreur chargement profil', err))

    if(!user){
        return <p> Chargement...</p>
    }


    }, [] );

    return (
    <div>
        <h2>Mon profil</h2>
        <p><strong>Nom:</strong> {user.name} </p>
        <p><strong>Email:</strong> {user.email} </p>
        <p><strong>Role:</strong> {user.role} </p>
    </div>
    )
}