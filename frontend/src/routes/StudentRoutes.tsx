import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";
import GoogleCallbackPage from "../pages/Auth/Google/AuthCallback";
import Profile from "../pages/Profile/Profile";

const StudentRoutes = (): RouteObject => {
    return {
        path: "/",
        element: <MinimalLayout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/profile",
                element: <Profile />,
            },
            {
                path: "/auth/google/callback",
                element: <GoogleCallbackPage />,
            },
        ],
    };
};

export default StudentRoutes;