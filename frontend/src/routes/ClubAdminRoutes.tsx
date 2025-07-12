import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import ActivitiManagement from "../pages/Activites/ActivityManagement ";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";
import Profile from "../pages/Profile/Profile";
import Clubs from "../pages/Clubs/ClubCategories";
import ClubAdminPage from "../pages/Clubs/ClubAdminPage";
import CreateClub from "../pages/Clubs/CreateClub";

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
                path: "/activity/management",
                element: <ActivitiManagement />,
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
                path: "/create-club",
                element: <CreateClub />,
            },
        ],
    };
};

export default ClubAdminRoutes;