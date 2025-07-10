import type { RouteObject } from "react-router-dom";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";
import Home from "../pages/Home";
import LoginPage from "../pages/Auth/Login/Login";
import SignUp from "../pages/Auth/Login/SignUp";
import GoogleCallbackPage from "../pages/Auth/Google/AuthCallback";
import Activities from "../pages/Activities/ActivitiesPage";
import ActivitiesDetail from '../pages/Activities/ActivitiesDetail';

const MainRoutes = (): RouteObject => {
    return {
        path: "/",

        element: <MinimalLayout />,

        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/login",
                element: <LoginPage />,
            },
            {
                path: "/signup",
                element: <SignUp />,
            },
            {
                path: "/auth/google/callback",
                element: <GoogleCallbackPage />,
            },
            {
                path: "/activities",
                element: <Activities />,
            },
            {
                path: "/activities/:id",
                element: <ActivitiesDetail />,
            },
        ],
    };
};

export default MainRoutes;