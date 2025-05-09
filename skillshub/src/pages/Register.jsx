import React, {useState} from 'react';
import axios from 'axios';

export default function Register(){
    const [formData, setFormData] = useState({ //stockage donnee
        name: '',
        email: '',
        password: '',
        role:'client',
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
             <input type="text" name="name" placeholder="Nom complet" value={formData.name} onChange={handleChange} required />
             <input type="text" name="email" placeholder="email" value={formData.email} onChange={handleChange} required />
             <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
             <select name="role" value={formData.role} onChange={handleChange}  required>
                <option value="client"> Client </option>
                <option value="freelance"> Freelance </option>
             </select>
             <button type="submit"> S'inscrire </button>
            </form>
        </div>
    );
}

//export default  Register;