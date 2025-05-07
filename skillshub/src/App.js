//import logo from './logo.svg';
import React from 'react';
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom';
import './App.css';
import Register from './pages/Register';


function LocationDisplay(){
  const location = useLocation();
  return <div style={{color: 'red', fontWeight: 'bold'}}> Chemin actuel : {location.pathname} </div>;
}


function App() {
  return (
    <BrowserRouter>
     <LocationDisplay/>
    <Routes>
     <Route path="/test" element={<div> Page de test  </div>} > </Route>
     <Route path="/register" element={<Register/>} > </Route>
     {/* <Route path="*" element={<div>Page non trouve</div>}> </Route>*/}
    </Routes>
   </BrowserRouter>
   
  );
}

export default App;
