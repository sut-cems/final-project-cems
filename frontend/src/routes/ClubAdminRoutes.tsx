import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import ActivitiesManagement from "../pages/Activities/ActivitiesManagement ";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";
import Profile from "../pages/Profile/Profile";
import Clubs from "../pages/Clubs/ClubCategories";
import ClubAdminPage from "../pages/Clubs/ClubAdminPage";
import Activities from "../pages/Activities/ActivitiesPage";
import EditActivities from "../pages/Activities/EditActivities";
import CreateActivities from "../pages/Activities/CreateActivities";
import ActivitiesDetail from "../pages/Activities/ActivitiesDetail";
import ActivitiesPhotos from "../pages/Activities/ActivitiesPhotosPage";
import AddActivitiesPhotos from "../pages/Activities/AddActivitiesPhoto";
import CreateClub from "../pages/Clubs/CreateClub";
import AddNewActivitiesPhotos from "../pages/Activities/AddNewActivitiesPhoto";

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
      {
        path: "/activities/edit/:id",
        element: <EditActivities />,
      },
      {
        path: "/activities/create",
        element: <CreateActivities />,
      },
      {
        path: "/activities/:id",
        element: <ActivitiesDetail />,
      },
      {
        path: "/activities/photo",
        element: <ActivitiesPhotos />,
      },
      {
        path: "/activities/photo/add-new-photo/",
        element: <AddNewActivitiesPhotos />,
      },
      {
        path: "/activities/photo/add-photo/:id",
        element: <AddActivitiesPhotos />,
      },
      {
        path: "/create-club",
        element: <CreateClub />,
      },
    ],
  };
};

export default ClubAdminRoutes;
