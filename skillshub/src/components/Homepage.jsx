import React from 'react';
import { Link } from 'react-router-dom';
import './homepage.css';

export default function Homepage() {
  return (

    <div className="homepage-container">
      {/* Titre principal */}
      <h1>Bienvenue sur SkillHub !</h1>

      {/* Description courte de la plateforme */}
      <p>
        Connectez les Jeunes Diplômés talentueux avec les Clients pour des missions passionnantes.
      </p>

      {/* Section pour les liens de navigation importants */}
      <div className="homepage-links">
        {/* Lien vers la page de connexion */}
   
        <Link to="/login" className="homepage-link-button"> 
          Se connecter
        </Link>

        {/* Lien vers la page d'inscription */}
        <Link to="/register" className="homepage-link-button"> 
          S'inscrire
        </Link>

        <Link to="/showMissions" className="homepage-link-button">
          Voir des missions
        </Link>

       

      </div>

       <div className="homepage-features"> 
         <h2>Pourquoi SkillHub ?</h2>
         <p>Trouvez des talents ou des opportunités rapidement.</p>
       
       </div>

       {/* Footer simple ou informations de contact */}
        <div className="homepage-footer-placeholder">
            <p>&copy; 2025 SkillHub. Tous droits réservés.</p>
        </div>


    </div>
  );
}
