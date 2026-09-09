import './Navbar.css'

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo"><span>L</span>ogic<span>F</span>orge</div>

            <div className="nav-links">
                <a href="#labs">Labs</a>
                <a href="#topics">Topics</a>
                <a href="#practice">Practice</a>
            </div>
        </nav>
    )   
}

export default Navbar