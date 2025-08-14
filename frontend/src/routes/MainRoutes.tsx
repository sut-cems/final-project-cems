import type { RouteObject } from "react-router-dom";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";
import Home from "../pages/Home";
import SignUp from "../pages/Auth/Login/SignUp";
import GoogleCallbackPage from "../pages/Auth/Google/AuthCallback";
import Activities from "../pages/Activities/ActivitiesPage";
import ActivitiesDetail from '../pages/Activities/ActivitiesDetail';
import Clubs from "../pages/Clubs/ClubCategories";
import ClubPage from "../pages/Clubs/ClubAdminPage";
import ResetPassword from "../pages/Auth/ResetPassword/ResetPassword";
import ForgotPassword from "../pages/Auth/ForgotPassword/ForgotPassword";

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
            {
                path: "/clubs",
                element: <Clubs />,
            },
            {
                path: "/clubs/:id",
                element: <ClubPage />,
            },
            {
                path: "/forgot-password",
                element: <ForgotPassword />,
            },
            {
                path: "/reset-password",
                element: <ResetPassword />,
            },
        ],
    };
};

export default MainRoutes;