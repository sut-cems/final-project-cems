import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";
import GoogleCallbackPage from "../pages/Auth/Google/AuthCallback";
import Profile from "../pages/Profile/Profile";
import Clubs from "../pages/Clubs/ClubCategories";
import ClubPage from "../pages/Clubs/ClubPage";
import ActivitiesPhotos from "../pages/Activities/ActivityPhoto";
import Activities from "../pages/Activities/ActivitesPage";

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
                path: "/activity/photo",
                element: <ActivitiesPhotos />,
            },
            {
                path: "/auth/google/callback",
                element: <GoogleCallbackPage />,
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
                path: "/activities",
                element: <Activities />,
            },
        ],
    };
};

export default StudentRoutes;