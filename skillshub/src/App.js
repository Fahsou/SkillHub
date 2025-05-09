//import logo from './logo.svg';
import React from 'react';
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom';
import './App.css';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ShowMissions from './pages/ShowMissions';
import CreateMissions from './pages/createMissions';
import Freelancers from './pages/Freelancers';
import Clients from './pages/Clients';
import MissionDetails from './pages/MissionDetail';

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
     <Route path="/login" element={<Login/>} > </Route>
     <Route path="/profile" element={<Profile/>} > </Route>
     <Route path="/showMissions" element={<ShowMissions/>}></Route>
     <Route path="/createMission" element={<CreateMissions/>}></Route>
     <Route path="/freelancers" element={<Freelancers/>} ></Route>
     <Route path="/clients" element={<Clients/>} ></Route>
     <Route path="/missions/:missionId" element={<MissionDetails/>} ></Route>

     {/* <Route path="*" element={<div>Page non trouve</div>}> </Route>*/}
    </Routes>
   </BrowserRouter>
   
  );
}

export default App;
