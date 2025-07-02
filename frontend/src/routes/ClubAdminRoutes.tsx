import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import ActivitiManagement from "../pages/ActivityManagement ";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";

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
        ],
    };
};

export default ClubAdminRoutes;