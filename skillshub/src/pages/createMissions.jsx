import React, {useState} from 'react';
import axios from 'axios';

//components 

export default function CreateMissions(){
    const [formData, setFormData] = useState({ //Etat de stockage de donnee
        title: '',
        description:'',
    
    });

    //changement d'etat pour l'envoi, erreur, success
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]= useState("");
    const [success, setSuccess] = ("");
    
    //gestion de changement dans le formulaire 
    const handleChange = (e) =>{
       setFormData ( prev =>({
         ...prev,
         [e.target.name]: e.target.value
       }));
    };

    //soumission formulaire
    const handleSubmit = async(e)=>{
      e.preventDefault(); //empeche le rechargment de la page
    //reinitialiser les messages
      
      const token = localStorage.getItem('token');

      if(!token){
        setError('Vous devez etre connecte pour creer une mission');
        setSubmitting(false);
        return;
      }

      //Donnee a envoye a l'API seulement title et description
      const dataToSend = {
        title: formData.title,
        description: formData.description
      };

      try{
        const reponse = await axios.post('http://localhost:5000/api/missions/createMission', dataToSend,
            { //config requete incluant header
                headers:{
                    'Content-Type': 'application/json', //dire au back que c'est du json
                    'Authorization': `Bearer ${token}`
                }

            }
        );
        console.log('Mission cree avec success', reponse.data); //reponse de axios
        //setSuccess('Mission cree avec success');  
        alert('Mission cree avec success');

      } catch(err){
        console.error('Erreur lors de la creation de mission:', err)
        setError('Echec de la creation de mission:'+(err.reponse?.data?.error || err.message));

      } finally{
        setSubmitting(false);
      }


    }
    
    
    return(
        <div className="show-mission-container">
            <h2>Ajouter une nouvelle mission </h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='title'>Title: </label>
                    <input type="text" id="title" name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                </div>
                <div>
                    <label htmlFor="description"> Description: </label>
                    <textarea id="description" name="description" 
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                </div>

                <button type="submit" disabled={submitting} >
                    {submitting? 'Creation en courd': 'Creer la mission'}
                </button>

            </form>

        {/*Affichage des messages d'erreur */}
        {success && <p style={{color: 'green'}} >{success} </p>}
        {error && <p style={{color: 'red'}} >{error} </p>}
        
        </div>
    )
}