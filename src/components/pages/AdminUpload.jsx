import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


export default function AdminUpload() {

const [image, setImage] = useState(null);
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [keywords, setKeywords] = useState("");
const [category, setCategory] = useState("");
const [subCategory, setSubCategory] = useState("");
const navigate = useNavigate();


useEffect(() => {

  const isAdmin = localStorage.getItem("isAdmin");

  if (!isAdmin) {
    navigate("/home");
  }

}, []);
const handleUpload = async () => {

if (!image) {
alert("Select image first");
return;
}

try {

const storageRef = ref(storage, `posts/${image.name}`);

await uploadBytes(storageRef, image);

const imageUrl = await getDownloadURL(storageRef);

await addDoc(collection(db, "postimg"), {
imageUrl,
title,
description,
keywords: keywords.split(","),
category,
subCategory,
createdAt: serverTimestamp()
});

alert("Uploaded Successfully");

setImage(null);
setTitle("");
setDescription("");
setKeywords("");

} catch (error) {
console.error(error);
alert("Upload Failed");
}
};

return (

<div style={{padding:"20px"}}>

<h2>Upload Post Image</h2>

<input type="file" onChange={(e)=>setImage(e.target.files[0])} />

<br/><br/>

<input
type="text"
placeholder="Title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
/>

<br/><br/>

<textarea
placeholder="Description"
value={description}
onChange={(e)=>setDescription(e.target.value)}
/>

<br/><br/>

<input
type="text"
placeholder="Keywords (comma separated)"
value={keywords}
onChange={(e)=>setKeywords(e.target.value)}
/>

<br/><br/>

<input
type="text"
placeholder="Category"
value={category}
onChange={(e)=>setCategory(e.target.value)}
/>

<br/><br/>

<input
type="text"
placeholder="SubCategory"
value={subCategory}
onChange={(e)=>setSubCategory(e.target.value)}
/>

<br/><br/>

<button onClick={handleUpload}>Upload</button>

</div>
);
}