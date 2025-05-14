import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/Token"; // Utilitaire pour récupérer le token

export default function Profile() {
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {

      const token = getToken();
      if (!user|| !token){
        setLoading(false);
        return;
      }

      try {
       
        const res = await axios.get("http://localhost:5000/api/users/profile", 
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data.user);

      } catch (err) {
        console.error("Erreur lors de la recuperatin de profil",err);
        setError("Erreur lors du chargement du profil");
        
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-600" >{error}</p>;

  return (
    <div className="max-w-md mx-auto mt-6 p-4 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Mon Profil</h2>
      <p><strong>Nom :</strong> {user.name}</p>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Role :</strong> {user.role}</p>
      {/* Ajoute d'autres champs selon la structure de ton backend */}
    </div>
  );
}