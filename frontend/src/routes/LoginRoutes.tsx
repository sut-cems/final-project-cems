import type { RouteObject } from "react-router-dom";
import Login from "../pages/Auth/Login/Login";
import SignUp from "../pages/Auth/Login/SignUp";

const LoginRoutes = (): RouteObject => {
  return {
    path: "/",
    children: [
      {
        path: "/",
        element: <Login/>,
      },
      {
        path: "/login",
        element: <Login/>,
      },
      {
        path: "/signup",
        element: <SignUp/>,
      },
    ],
  };
};

export default LoginRoutes;