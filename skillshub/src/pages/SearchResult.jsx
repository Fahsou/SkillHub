import React, {useState, useEffect} from "react";
import { useLocation } from "react-router-dom";
import axios from 'axios';

export default function SearchResult(){
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // Recupere le terme de recherche depuis le parametre 'keyword'
    const keyword = queryParams.get('keyword') || '';

    //etat pour stocker les resultats de recherche
    const [results, setResults] = useState([]);
    const [loading, setLoading ] = useState(false);
    const [error, setError] = useState('');

     console.log(">>> SearchResults.jsx: Page chargee. Terme de recherche:", keyword);

    useEffect(()=>{
        if(!keyword){
            setResults([]);
            setLoading(false);
            setError('');
            console.log(">>> SearchResults.jsx useEffect: Aucun mot-cle fourni, pas de recherche API.");
            return;
        }

    const fetchSearchResults = async () =>{
        setLoading(true);
        setError('');

        try{
            console.log(`>>> SearchResults.jsx useEffect: Recherche API pour "${keyword}"`);

            const [missionsRes, freelancersRes  ] = await Promise.all([
                axios.get(`http://localhost:5000/api/search/missions?keyword=${encodeURIComponent(keyword)}`),
                axios.get(`http://localhost:5000/api/search/freelancers?keyword=${encodeURIComponent(keyword)}`)
             ]);
       
             setResults({
                missions: missionsRes.data,
                freelancers: freelancersRes.data
             });

             console.log(">>> SearchResults.jsx useEffect: Reponse API de recherche recue:", {missions, freelancers});

     } catch (err) {
        console.error(">>> SearchResults.jsx useEffect: ERREUR lors de la recherche API:", err);
        setError('Erreur lors de la recherche. Veuillez reessayer.'); // Message d'erreur utilisateur
        setResults([]); 
     }finally{
        setLoading(false);
     }

    };

    fetchSearchResults();
 }, [keyword] );
 
 return(
  <div className="">
    <h2 > Resultat de recherche {keyword && `pour ${keyword}` } </h2>

    {loading && <p> Chargement... </p>}
    {error && <p style={{color: 'red'}} > Erreur: {error} </p>}

    {!loading && !error && (
        <div> 
            {results.length >0 ? (
                <ul>
                    {results.map( item =>{
                        return(
                            <li key={item.id || item.id_users}  ></li>
                        );
                    } )}

                </ul>
            ): () }
        </div>

    )}

  </div>
 );

}