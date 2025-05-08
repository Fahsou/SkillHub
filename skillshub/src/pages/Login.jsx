import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';

 export default function Login(){
//etat stockage de valeur
 const  [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const navigate = useNavigate();

 const handleSubmit = async (e)=>{
    e.preventDefault();

    setError('');

   if (!email || !password){
     setError('Veuillez remplir tous les champs');
     return;
   }

   try{
     const reponse  = await fetch('http://localhost:5000/api/auth/login', {
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });

      if (!reponse.ok){
        const errData = await reponse.json();
        throw new Error(errData.error || 'Erreur de connexion');
      }
      
      const data = await reponse.json();
      console.log('Connexion reussie', data);
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard');
    
    } catch(err){
    console.error('Erreur de connexion:', err)
    setError(err.message || 'Erreur  de connexion')
    }


 }



 return (
    <div className = " login-container">
        <h2>Connexion</h2>
        <form onSubmit = {handleSubmit} className="login-form">
            <div>
                <label htmlFor="email">Email: </label>
                <input  type ="email" placeholder ="Entre mail " value={email}
                  onChange={(e)=>{setEmail(e.target.value)} } required
                 />
            </div>

            <div>
                <label htmlFor="password">Mot de passe:</label>
                <input  type ="password" placeholder ="mot de passe " value={password}
                  onChange={(e)=>{setPassword(e.target.value)} } required
                 />
            </div>
            {error && <p className="error-message">{error} </p>}

            <button type="submit"> Se connecter </button>

        </form>
    </div>
 );

 }