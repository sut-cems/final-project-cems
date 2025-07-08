import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import ActivitiesManagement from "../pages/Activities/ActivitiesManagement ";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";
import Profile from "../pages/Profile/Profile";
import Clubs from "../pages/Clubs/ClubCategories";
import ClubAdminPage from "../pages/Clubs/ClubAdminPage";
import Activities from "../pages/Activities/ActivitesPage";

const ClubAdminRoutes = (): RouteObject => {
    return {
        path: "/",
        element: <MinimalLayout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/activities/management",
                element: <ActivitiesManagement />,
            },
            {
                path: "/profile",
                element: <Profile />,
            },
            {
                path: "/clubs",
                element: <Clubs />,
            },
            {
                path: "/clubs/:id",
                element: <ClubAdminPage />,
            },
                        {
                path: "/activities",
                element: <Activities />,
            },
        ],
    };
};

export default ClubAdminRoutes;