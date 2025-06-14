import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import MinimalLayout from "../layouts/MinimalLayout/MinimalLayout";


const AdminRoutes = (): RouteObject => {
	return {
		path: "/",
		element: <MinimalLayout />,
		children: [
			{
				path: "/",
				element: <Home />
			},	

		]
	}
}
export default AdminRoutes;