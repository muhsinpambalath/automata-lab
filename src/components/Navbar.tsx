import './Navbar.css'
import logo from '../assets/Logo.svg'
import { Link } from 'react-router-dom'


function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/">
                    <img src={logo} alt="LogicForge" />
                </Link>
            </div>

            <div className="nav-links">
                <Link to="/lab">Labs</Link>
                <Link to="/topics">Topics</Link>
                <Link to="/Practice">Practice</Link>
            </div>
        </nav>
    )   
}

export default Navbar