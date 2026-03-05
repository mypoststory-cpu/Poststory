import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const navigate = useNavigate();

const handleLogin = () => {

if(email === "admin@poststory.com" && password === "123456"){

localStorage.setItem("isAdmin", "true");   // string value

navigate("/admin/dashboard");

}else{

alert("Invalid Admin Login");

}

};

return (

<div style={{padding:"40px", maxWidth:"400px", margin:"auto"}}>

<h2>Admin Login</h2>

<input
type="email"
placeholder="Admin Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={{width:"100%", padding:"10px"}}
/>

<br/><br/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={{width:"100%", padding:"10px"}}
/>

<br/><br/>

<button 
onClick={handleLogin}
style={{width:"100%", padding:"10px", background:"black", color:"white"}}
>
Login
</button>

</div>

);

}