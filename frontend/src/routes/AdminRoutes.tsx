import type { RouteObject } from "react-router-dom";
import UniversityInfoPage from "../pages/Admin/University/UniversityInfo";
import CreateUniversityInfoPage from "../pages/Admin/University/CreateUniversityInfo";
import EditUniversityInfoPage from "../pages/Admin/University/EditUniversityInfo";
import CEMSDashboard from "../pages/Admin/Dashboard";
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
                path: "/university-info",
                element: <UniversityInfoPage />,
            },
			{
                path: "/university-info/create",
                element: <CreateUniversityInfoPage />,
            },
			{
                path: "/university-info/edit/:id",
                element: <EditUniversityInfoPage />,
            },
			{
                path: "/manage/clubs",
                element: <ClubPage />,
            },
		]
	}
}
export default AdminRoutes;