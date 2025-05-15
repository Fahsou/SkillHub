import React, {useState, useEffect} from "react";
import { useLocation, Link } from "react-router-dom";
import axios from 'axios';

export default function SearchResult(){
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // Recupere le terme de recherche depuis le parametre 'keyword'
    const keyword = queryParams.get('keyword') || '';

    //etat pour stocker les resultats de recherche
    const [missionsResults, setMissionsResults] = useState([]);
    const [freelancersResults, setFreelancersResults] = useState([]);

    const [loading, setLoading ] = useState(false);
    const [error, setError] = useState('');

     console.log(">>> SearchResults.jsx: Page chargee. Terme de recherche:", keyword);

    useEffect(()=>{
        if(!keyword){
            setMissionsResults([]);
            setFreelancersResults([]);
            setLoading(false);
            setError('');
            console.log(">>> SearchResults.jsx useEffect: Aucun mot-cle fourni, pas de recherche API.");
            return;
        }

    const fetchSearchResults = async () =>{
        setLoading(true);
        setError('');
        setMissionsResults([]); //Vide les resultats precedents avant de lancer la nouvelle recherche
        setFreelancersResults([]);

        try{
            console.log(`>>> SearchResults.jsx useEffect: Recherche API pour "${keyword}" missions et freelancers`);

            const [missionsRes, freelancersRes  ] = await Promise.all([
                axios.get(`http://localhost:5000/api/search/missions?keyword=${encodeURIComponent(keyword)}`),
                axios.get(`http://localhost:5000/api/search/freelancers?keyword=${encodeURIComponent(keyword)}`)
             ]);
       
           
             console.log(">>> SearchResults.jsx useEffect: Reponses API recues.");
             console.log(">>> Missions Response:", missionsRes.data);
             console.log(">>> Freelancers Response:", freelancersRes.data);

             if(missionsRes.data){
                setMissionsResults(missionsRes.data);
             }else{
                setMissionsResults([]);
                console.warn('>> SearchResults.jsx useEffect: Reponse API Missions - Donnees manquantes');
             }
             
             if(freelancersRes.data){
                setFreelancersResults(freelancersRes.data);
             }else{
                setFreelancersResults([]);
                console.warn('>>> SearchResults.jsx useEffect: Reponse API Freelancers - Donnees manquantes.');
             }

     } catch (err) {
        console.error(">>> SearchResults.jsx useEffect: ERREUR lors de la recherche API:", err);
        setError('Erreur lors de la recherche. Veuillez reessayer.'); // Message d'erreur utilisateur
        setMissionsResults([]); 
        setFreelancersResults([]);
     }finally{
        setLoading(false);
     }

    };

    fetchSearchResults();
 }, [keyword] );
 
 return(
  <div className="search-results-container">
    <h2 > Resultat de recherche {keyword && `pour ${keyword}` } </h2>

    {loading && <p> Chargement... </p>}
    {error && <p style={{color: 'red'}} > Erreur: {error} </p>}

    {!loading && !error && (
        <div> 
            
          {/* Section Resultats Missions */}

          <h3> Missions: ({missionsResults.length}) </h3>
            {missionsResults.length >0 ? (
                <ul>
                    {missionsResults.map( mission =>{
                        return(
                            <li key={mission.id || mission.id_missions}  >
                                {mission.title || 'Mission sans titre'} {' '}
                            <Link to={`/missions/${mission.id_missions}`}>Voir la mission </Link>
                            </li>
                        
                        );
                    } )}
                   
                </ul>
            ): (
                <p> Aucune mission trouvee pour "{keyword}" </p>
            ) }
            <hr/>
            {/* Section Resultats Freelancers */}
            <h3> Candidats: ({freelancersResults.length}) </h3>
            {freelancersResults.length>0 ? (
                <ul>
                    {freelancersResults.map(freelancer =>{
                        return(
                            <li key={freelancer.id || freelancer.id_users } >
                                {freelancer.role || 'Freelancer sans nom'} - Role : {freelancer.role}
                            </li>
                            
                        )
                    } )}
                </ul>
            ): (
                <p> Aucun freelancer trouve pour "{keyword}" </p>
            ) }

        </div>

    )}

    {!loading && !error && missionsResults.length === 0 && freelancersResults.length === 0
    && keyword && (
        <p> Aucun resultat (missions ou freelancers) trouve pour "{keyword}". </p>
    )}

  </div>
 );

}