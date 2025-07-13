import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";
import GoogleCallbackPage from "../pages/Auth/Google/AuthCallback";
import Profile from "../pages/Profile/Profile";
import Clubs from "../pages/Clubs/ClubCategories";
import ClubPage from "../pages/Clubs/ClubPage";
import ActivitiesPhotos from "../pages/Activities/ActivitiesPhotosPage";
import Activities from "../pages/Activities/ActivitiesPage";
import ActivitiesDetail from "../pages/Activities/ActivitiesDetail";
import CreateClub from "../pages/Clubs/CreateClub";

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
        path: "/activities/photo",
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
      {
        path: "/activities/:id",
        element: <ActivitiesDetail />,
      },
      {
        path: "/create-club",
        element: <CreateClub />,
      },
    ],
  };
};

export default StudentRoutes;
