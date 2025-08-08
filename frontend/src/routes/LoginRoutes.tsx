import type { RouteObject } from "react-router-dom";
import SignUp from "../pages/Auth/Login/SignUp";
import ResetPassword from "../pages/Auth/ResetPassword/ResetPassword";

const LoginRoutes = (): RouteObject => {
  return {
    path: "/",
    children: [
      {
        path: "/signup",
        element: <SignUp/>,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
    ],
  };
};

export default LoginRoutes;