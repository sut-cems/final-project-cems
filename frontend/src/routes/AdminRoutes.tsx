import type { RouteObject } from "react-router-dom";
import Profile from "../pages/Profile/Profile";
import CEMSDashboard from "../pages/Admin/Dashboad";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ReportsManagemet from "../components/Reports/ReportsDashboard";
import ClubPage from "../pages/Admin/Club";

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
				path: "/manage-reports",
				element: <ReportsManagemet />
			},
			{
                path: "/profile",
                element: <Profile />,
            },
			{
                path: "/manage/clubs",
                element: <ClubPage />,
            },
		]
	}
}
export default AdminRoutes;