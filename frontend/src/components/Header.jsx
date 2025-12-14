import "../styles/Button.css";
import "../styles/Header.css";
import Logo from "./Logo";
import userIcon from "../assets/user-icon.svg";

function Header({ user, logout }) {
    return (
        <header className="header">
            <Logo />

            <div className="header-user">
                <span className="header-user-info">
                    <img src={userIcon} alt="User Icon" />
                    <p>{user.email}</p>
                </span>

                <button className="btn btn-stop btn-logout" onClick={logout}>
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Header;
