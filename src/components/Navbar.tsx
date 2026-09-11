import './Navbar.css'
import logo from '../assets/Logo.svg'

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo"><img src={logo} alt="LogicForge" /></div>

            <div className="nav-links">
                <a href="#labs">Labs</a>
                <a href="#topics">Topics</a>
                <a href="#practice">Practice</a>
            </div>
        </nav>
    )   
}

export default Navbar