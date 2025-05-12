import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register(){
    const [formData, setFormData] = useState({ //stockage donnee
        name: '',
        email: '',
        password: '',
        role:'client',
    });

    const[success, setSuccessMessage]= useState(null);
    const[error, setError]= useState(null);
    const navigate = useNavigate();

    const handleChange = (e) =>{
        setFormData(prev =>({
            ...prev,
            [e.target.name]: e.target.value
        }) );
    };

    const handleSubmit = async (e) =>{
        e.preventDefault();

        setSuccessMessage(null);
        setError(null);

        try{
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            console.log('Inscription resussi', res.data);
          setSuccessMessage('Inscription reussi');
            setTimeout(()=>{
                navigate('/profile');
            } , 2000 );

        }catch(err){
            console.error('Erreur inscritpion', err.reponse?.data || err.message);
            setError('Echec inscription');
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

            {success && <p style={{ color: 'green' }}>{success}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}


        </div>
    );
}

