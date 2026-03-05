import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard(){

const navigate = useNavigate();

useEffect(()=>{

const isAdmin = localStorage.getItem("isAdmin");

if(!isAdmin){

navigate("/admin/login");

}

},[]);

const logout = () => {

localStorage.removeItem("isAdmin");

navigate("/admin/login");

};

return(

<div style={{padding:"40px"}}>

<h2>Admin Dashboard</h2>

<br/>

<button onClick={()=>navigate("/admin/upload")}>
Upload Images
</button>

<br/><br/>

<button onClick={logout}>
Logout
</button>

</div>

);

}