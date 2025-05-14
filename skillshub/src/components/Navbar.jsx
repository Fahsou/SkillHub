import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="custom-navbar">

      <div className="navbar-brand-container">
          <Link className="custom-navbar-brand" to="/" onClick={handleLinkClick}>
            SkillHub
          </Link>
      </div>

      {/* --- Bouton de basculement (Hamburger) --- */}
      <button
        className="navbar-toggler"
        onClick={handleToggleMenu}
        aria-label="Toggle navigation"
        aria-expanded={isMenuOpen}
      >
        {/* --- Remplacez &#9776; par ce span --- */}
        <span className="hamburger-icon"> &#9776;</span>
        {/* ------------------------------------ */}
      </button>


      {/* --- Conteneur des liens de navigation --- */}
      <div className={`navbar-links-container ${isMenuOpen ? 'open' : ''}`}>
        {/* ... reste de votre liste ul.custom-navbar-nav avec les li et links ... */}

        <ul className="custom-navbar-nav"> {/* Votre liste de liens existante */}

            {/* Lien Accueil */}
            <li className="custom-nav-item">
              <Link className="custom-nav-link" to="/" onClick={handleLinkClick}>
                Accueil
              </Link>
            </li>

            {/* Liens conditionnels */}
            {user ? (
              <> {/* Fragment React */}
                {/* Lien Tableau de bord */}
                <li className="custom-nav-item">
                   <Link className="custom-nav-link" to="/dashboard" onClick={handleLinkClick}>
                     Tableau de bord
                   </Link>
                </li>

               {/* Nom de l'utilisateur */}
               <li className="custom-nav-item">
                  <span className="custom-nav-link">Bonjour, {user.name || 'Utilisateur'}</span>
               </li>

              {/* Bouton Déconnexion ajout handlelogout plus tard */}
              <li className="custom-nav-item">
                <button
                  onClick={() => {onLogout(); handleLinkClick(); }} 
                  className="custom-logout-button"
                >
                  Déconnexion
                </button>
              </li>
            </>
          ) : (
            // Si déconnecté
            <>
              {/* Lien Se connecter */}
              <li className="custom-nav-item">
                <Link className="custom-nav-link" to="/login" onClick={handleLinkClick}>
                  Se connecter
                
                </Link>
              </li>
              {/* Lien S'inscrire */}
              <li className="custom-nav-item">
                <Link className="custom-nav-link" to="/register" onClick={handleLinkClick}>
                  S'inscrire
                </Link>
              </li>
            </>
          )}
        </ul>

      </div>

    </nav>
  );
}
