import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";
import Clubs from "../pages/Clubs/ClubCategories";
import ClubAdminPage from "../pages/Clubs/ClubAdminPage";

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
                path: "/clubs",
                element: <Clubs />,
            },
            {
                path: "/clubs/:id",
                element: <ClubAdminPage />,
            },
        ],
    };
};

export default ClubAdminRoutes;