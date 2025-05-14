import { useState } from "react";
import { useNavigate} from "react-router-dom";
import { setToken } from "../utils/Token";
import axios from "axios";

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
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800" > Connexion </h2>

      {error &&(
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded" > {error} </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4" >
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700" > Email: </label>
          <input  type="email" value={email} 
          onChange={(e)=> setEmail(e.target.value) } required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"

          />

        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700" > Mot de passe: </label>
          <input  type="password" value={password} 
          onChange={(e)=> setPassword(e.target.value) } required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <button type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-blue py-2 rounded transition"
        >
          Se connecter
        </button>



      </form>


    </div>
  </div>
  )
}