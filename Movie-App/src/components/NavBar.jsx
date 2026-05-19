import React from 'react'
import { Link } from "react-router-dom";
import "../css/navbar.css"

const NavBar = () => {
  return (
    <>
    <div className='navbar'>
       <div className="navbar-brand">
            <Link to= "/">FlickFind</Link>
        </div>
        <div className="navbar-links">
             <Link className="nav-link" to= "/">Home</Link>
            <Link className="nav-link" to= "/favorites">Favorites</Link>
        </div>
    </div>
       
    </>
  )
}

export default NavBar