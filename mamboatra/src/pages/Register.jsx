import React, {useState} from 'react';
import axios from 'axios';

function Register(){
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: ''
    });

    const handleChange = (e) =>{
        setFormData(prev =>({
            ...prev,
            [e.target.name]: e.target.value
        }) );
    };

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            console.log('Inscription resussi', res.data);
          alert('Inscritption reussi');
        }catch(err){
            console.error('Erreur inscritpion', err.reponse?.data || err.message);
            alert('Echec inscription');
        }
    };

    return(
        <div className="register-form">
            <h2>Inscritption</h2>
            <form onSubmit={handleSubmit} > 
             <input type="text" name="fullname" placeholder="Nom complet" value={formData.fullname} onChange={handleChange} required />
             <input type="text" name="email" placeholder="email" value={formData.email} onChange={handleChange} required />
             <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
             <button type="submit"> S'inscrire </button>
            </form>
        </div>
    );
}

export default Register;