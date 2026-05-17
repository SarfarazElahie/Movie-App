import { Route, Routes } from "react-router-dom";
import "./css/App.css";
import MovieCard from "./components/MovieCard";
import Home from "./components/pages/Home";
import Favorites from "./components/pages/Favorites";
import NavBar from "./components/NavBar";
import { MovieProvider } from "./contexts/MovieContext";
import MovieDetails from "./components/pages/MovieDetails";
function App() {
  
  return (
    <>
    <MovieProvider>
       <NavBar />
     <main className="main-content">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/favorites" element={<Favorites/>}/>
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
     </main>
    </MovieProvider>
   
    </> 
  );
}

export default App;
