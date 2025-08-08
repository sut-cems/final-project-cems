import type { RouteObject } from "react-router-dom";
import CEMSDashboard from "../pages/Admin/Dashboad";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ReportsManagemet from "../components/Reports/ReportsDashboard";
import AdminProfile from "../pages/Profile/AdminProfile";

const AdminRoutes = (): RouteObject => {
	return {
	path: "/",
		element: <AdminLayout />,
		children: [		
			{
				path: "/",
				element: <CEMSDashboard />
			},
			{
				path: "/dashboard",
				element: <CEMSDashboard />
			},
			{
				path: "/manage-reports",
				element: <ReportsManagemet />
			},
			{
                path: "/profile",
                element: <AdminProfile />,
            },
		]
	}
}
export default AdminRoutes;