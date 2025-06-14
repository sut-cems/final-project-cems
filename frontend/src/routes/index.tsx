import { useRoutes, type RouteObject } from "react-router-dom";
import LoginRoutes from "./LoginRoutes";
import MainRoutes from "./MainRoutes";
import AdminRoutes from "./AdminRoutes";
import ClubAdminRoutes from "./ClubAdminRoutes";
import StudentRoutes from "./StudentRoutes";


export const role = localStorage.getItem('role')
export const isAdmin = role === 'Admin'
export const isManager = role === 'Manager'
export const isOperator = role === 'Operator'

function ConfigRoutes() {
  const isLoggedIn = localStorage.getItem("isLogin") === "true"; 
  const role = localStorage.getItem("role"); 

  let routes: RouteObject[] = []; // กำหนดค่าเริ่มต้นให้กับ routes

  // ตรวจสอบว่าเข้าสู่ระบบหรือยัง
  if (isLoggedIn) {
    switch (role) {
      case "admin":
        routes = [AdminRoutes()];
        break;
      case "club_admin":
        routes = [ClubAdminRoutes()]; 
        break;
      case "student":
        routes = [StudentRoutes()]; 
        break;
      default:
        routes = [LoginRoutes()];
    }
  } else {
    routes = [MainRoutes ()];
  }

  return useRoutes(routes); // ใช้ useRoutes กับ routes ที่ได้จากเงื่อนไขข้างต้น
}

export default ConfigRoutes;