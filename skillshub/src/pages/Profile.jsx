import React, {useState, useEffect} from 'react';

export default function Profile(){

    const [user, setUser] = useState(null);
    
    useEffect(()=>{
    //recupere l'utilisateur depuis localstorage si stocke apres le login

    const storedUser = localStorage.getItem('user');
    if(storedUser){
        setUser(JSON.parse(storedUser));
    }

    if(!user){
        return <p>Veuillez vous connecter</p>
    }


    } )

    return (
    <div>
        <h2>Mon profil</h2>
        <p><strong>Nom:</strong> {user.name} </p>
        <p><strong>Email:</strong> {user.email} </p>
        <p><strong>Role:</strong> {user.role} </p>
    </div>
    )
}