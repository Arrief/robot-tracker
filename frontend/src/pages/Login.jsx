import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FadeLoader } from "react-spinners";
import Logo from "../components/Logo";
import "../styles/Button.css";
import "../styles/Login.css";

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY_FORM_DATA = {
    email: "",
    password: "",
};

function Login() {
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM_DATA);
    const [isLoading, setIsLoading] = useState(false);

    function handleUserInput(event) {
        if (errorMessage) {
            setErrorMessage(null);
        }

        setFormData((oldFormData) => ({
            ...oldFormData,
            [event.target.name]: event.target.value,
        }));
    }

    async function handleLogin(event) {
        event.preventDefault();
        setErrorMessage(null);

        if (!formData.email || !formData.password) {
            setErrorMessage("E-Mail und Passwort sind Pflichtfelder.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Login fehlgeschlagen, Status: ${response.status}`
                );
            }

            const data = await response.json();

            localStorage.setItem("token-robot-tracker", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setFormData(EMPTY_FORM_DATA);

            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error.message || "Es ist ein unerwarteter Fehler aufgetreten."
            );
        } finally {
            setIsLoading(false);
        }
    }

    // Clear local storage on component mounting
    useEffect(() => {
        localStorage.removeItem("token-robot-tracker");
        localStorage.removeItem("user");
    }, []);

    return (
        <div className="login-page">
            <div className="login-card">
                <Logo />
                <p className="subtitle">🤖 Bitte melden Sie sich an 🤖</p>

                {/* "noValidate" to enable manual errorMessage in handleLogin; alternatively omit "required" */}
                <form className="login-form" onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label htmlFor="email">E-Mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleUserInput}
                            required
                            placeholder="Ihre E-Mail..."
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Passwort</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password || ""}
                            onChange={handleUserInput}
                            required
                            placeholder="Ihr Passwort..."
                            disabled={isLoading}
                        />
                    </div>

                    {errorMessage && (
                        <div className="error-message">{errorMessage}</div>
                    )}

                    <button
                        className="btn btn-start"
                        disabled={isLoading}
                        type="submit"
                    >
                        {isLoading ? (
                            <div className="loading-spinner-container">
                                <FadeLoader />
                            </div>
                        ) : (
                            "Anmelden"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
