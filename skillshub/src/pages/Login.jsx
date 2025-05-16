import { useState } from "react";
import { useNavigate} from "react-router-dom";
import { setToken } from "../utils/Token";
import axios from "axios";
import './login.css';

export default function Login (){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const[error, setError] = useState("");


  const navigate = useNavigate();

  const handleLogin = async (e) =>{
    e.preventDefault();

    try{
      const res = await axios.post('http://localhost:5000/api/auth/login', {email, password} );

       const {token}= res.data;
       setToken(token);
       navigate('/profile');


    } catch(err){
      if(err.response && err.response.data?.message){
        setError(err.response.data.message);
      } else{
        setError('Erreur de connexion');
      }
      console.error(err);

    }

  };



  return(
  <div className="login-container">
    <div className="login-form-container">
      <h2 className="login-title" > Connexion </h2>

      {error &&(
        <div className="error" > {error} </div>
      )}

      <form onSubmit={handleLogin} className="login-form" >
        <div>
          <label className="label" > Email: </label>
          <input  type="email" value={email} 
          onChange={(e)=> setEmail(e.target.value) } required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"

          />

        </div>

        <div>
          <label className="label" > Mot de passe: </label>
          <input  type="password" value={password} 
          onChange={(e)=> setPassword(e.target.value) } required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <button type="submit"
        className="button-submit"
        >
          Se connecter
        </button>



      </form>


    </div>
  </div>
  )
}