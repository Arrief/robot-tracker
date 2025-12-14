import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token-robot-tracker");

    if (!token || token === "undefined" || token === "null") {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
