import React from 'react';
// Si vous utilisez React Router DOM pour les liens, importez Link
// Assurez-vous d'avoir installé react-router-dom si ce n'est pas déjà fait (npm install react-router-dom ou yarn add react-router-dom)
import { Link } from 'react-router-dom';

// --- Importer le fichier CSS ---
// Assurez-vous que le chemin d'accès à votre fichier CSS est correct
import './homepage.css';

// Assurez-vous que ce composant est bien exporté par défaut
export default function Homepage() {
  return (
    // Utilisez un div pour le conteneur principal de la page
    // Utilisez des classes CSS pour un stylage plus facile
    <div className="homepage-container">
      {/* Titre principal */}
      <h1>Bienvenue sur SkillHub !</h1>

      {/* Description courte de la plateforme */}
      <p>
        Connectez les Jeunes Diplômés Freelancers avec les Clients pour des missions passionnantes.
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

        {/* Optionnel: Lien vers la page de navigation des missions (pour les freelancers) */}
        {/* Ce lien pourrait n'apparaître que si l'utilisateur n'est PAS connecté */}
         {/* <Link to="/missions" className="homepage-link-button">
           Voir les missions disponibles
         </Link> */}

      </div>

      {/* Optionnel: Une section pour les fonctionnalités clés, des témoignages, etc. */}
       <div className="homepage-features"> {/* Ajoutez une classe CSS */}
         <h2>Pourquoi SkillHub ?</h2>
         <p>Trouvez des talents ou des opportunités rapidement.</p>
         {/* Ajoutez d'autres points forts ici */}
       </div>

       {/* Optionnel: Footer simple ou informations de contact */}
        <div className="homepage-footer-placeholder">
            <p>&copy; 2025 SkillHub. Tous droits réservés.</p>
        </div>


    </div>
  );
}
