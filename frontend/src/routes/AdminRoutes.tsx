import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";
import Profile from "../pages/Profile/Profile";

const AdminRoutes = (): RouteObject => {
	return {
		path: "/",
		element: <MinimalLayout />,
		children: [
			{
				path: "/",
				element: <Home />
			},
			{
                path: "/profile",
                element: <Profile />,
            },
		]
	}
}
export default AdminRoutes;