import React from "react";
import { Link } from "react-router-dom";

export default function Homepage(){
    return (
        <div className="Homepage-container">
            <h2 className="home-title"> Bienvenue sur Freshers </h2>

        <p>
        Connectez les Jeunes Diplômés  avec les Clients pour des missions passionnantes. 
        Aidez les jeunes sans experiences pro a acquerir leur premiere mission avec leur domaine.
      </p>

      <Link to="/login" className="homepage-link-button">
          Se connecter
        </Link>
     <Link to="/register" className="homepage-link-button"> 
          S'inscrire
        </Link>

        <div className="homepage-features">
         <h2>Pourquoi SkillHub ?</h2>
         <p>Trouvez des talents ou des opportunités rapidement.</p>
       </div>

       <div className="homepage-footer-placeholder">
            <p>&copy; 2025 Freshers. Tous droits réservés.</p>
        </div>









        </div>
    )
}