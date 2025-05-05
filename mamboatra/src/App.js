import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Register from "./pages/Register";
import Missions from './pages/Missions';
import MissionDetail from './pages/MissionsDetail';
import Freelancers from './pages/Freelancers';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Application';

function App() {
  return (
    <Router>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
     <Routes>
       <Route  path="/register"  element={<Register/>}/>
       <Route  path="/login"  element={<Login/>} />
       <Route  path="/missions"  element={<Missions/>} />
       <Route  path="/missions/:id"  element={<MissionDetail/>} />
       <Route  path="/freelancers"  element={<Freelancers/>} />
       <Route  path="/profile"  element={<Profile/>} />
       <Route  path="/dashboard"  element={<Dashboard/>} />
       <Route  path="/applications"  element={<Applications/>} />
     </Routes>

    </div>
 </Router>

  );
}

export default App;
