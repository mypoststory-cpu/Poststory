import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {

const isAdmin = localStorage.getItem("isAdmin");

return isAdmin === "true" ? children : <Navigate to="/admin/login" />;

}