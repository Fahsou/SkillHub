import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthentified, removeToken } from "../utils/Token";
import "./Navbar.css";


export default function Navbar(){

  const [isMenuOpen, setIsMenuOpen]= useState(false);
  const navigate = useNavigate();

  const toggleMenu = () =>{
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () =>{
    removeToken();
    navigate("/login");
    setIsMenuOpen(false);
  };

  //Pour la navigation de recherche
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) =>{
    e.preventDefault();

    if(searchTerm.trim()){
      navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`); 
      setSearchTerm('');
    }
  }

  return (
    
      <nav className="navbar" >
        <h2 className="navbar-brand" > Skillhub </h2>

         {/* Bouton Hamburger - Visible uniquement sur mobile grâce au CSS */}
         <button className={`hamburger-button ${isMenuOpen ? 'open' : ''}`}
         onClick={toggleMenu}
         aria-label="Toggle menu"
         >
          <span className="hamburger-icon">  &#9776;</span>
  

          
         </button>

         {/* Liste des liens de navigation */}

         <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          <li> <Link to="/" onClick={toggleMenu} > Acceuil </Link> </li>
          <form onSubmit={handleSearch} >
            <input type="text"  placeholder="Rechercher"  value={searchTerm}
            onChange={ (e)=>setSearchTerm(e.target.value) } />
            <button type="submit" > Rechercher </button>
          </form>

        

          {isAuthentified()? (// Liens affichés si l'utilisateur est connecté
            <>
            <li>
              <Link to="/profile"  onClick={toggleMenu} > Profil </Link>
            </li>

            <li>
              <Link to="/dashboard"  onClick={toggleMenu} > Tableau de bord </Link>
            </li>

            <li>
              <Link to="/login"  onClick={handleLogout} > Deconnexion </Link>
            </li>

            </>
          ): ( //Liens affichés si l'utilisateur n'est PAS connecté
         <>
             <li>
              <Link to="/login"  onClick={toggleMenu} > Connexion </Link>
            </li>

            <li>
              <Link to="/register"  onClick={toggleMenu} > Inscription </Link>
            </li>
         </>

          ) }
       </ul>
    </nav>

  );

}