import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// Define the types for the props
interface RouteGuardProps {
    children: ReactNode;
    allowedRole: string;
    redirectPath: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRole, redirectPath }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwt_auth");
        if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.role === allowedRole) {
                setIsAuthenticated(true);
            } else {
                navigate(redirectPath);
            }
        } catch (e) {
            console.log(e);
            navigate(redirectPath);
        }
        } else {
        navigate(redirectPath);
        }
    }, [allowedRole, navigate, redirectPath]);

    return isAuthenticated ? <>{children}</> : null;
};

export default RouteGuard;
