import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { checkAdmin } from "../checkAdmin";
import { useNavigate } from "react-router-dom";

export default function AdminBulkUpload() {
  const [posts, setPosts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();


  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const tempPosts = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      title: "Title", 
      description: "Description",
      keywords: "Keyword",
      category: "Category",   
      subCategory: "SubCategory",
      language: "Language"      
    }));
    setPosts([...posts, ...tempPosts]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...posts];
    updated[index][field] = value;
    setPosts(updated);
  };

 const handleUpload = async () => {
  setUploading(true);
  try {
    for (let post of posts) {
      // Create folderName inside the loop to avoid "ReferenceError: post is not defined"
      const folderName = post.subCategory.replace(/\s+/g, '_'); 
      
      const storageRef = ref(storage, `post/${post.category}/${folderName}/${Date.now()}_${post.file.name}`);
      await uploadBytes(storageRef, post.file);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "postimg"), {
        imageUrl,
        title: post.title,
        description: post.description,
        keywords: post.keywords,
        category: post.category, 
        subCategory: post.subCategory,
        language: post.language,
        createdAt: serverTimestamp(),
      });
    }
    alert("All Images Uploaded! ✅");
    setPosts([]);
  } catch (error) {
    console.error(error);
    alert("Upload Failed!");
  }
  setUploading(false);
};

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h2>Admin Bulk Upload (Advanced)</h2>
      <input type="file" multiple onChange={handleFiles} accept="image/*" />

      <div style={{ marginTop: "20px" }}>
        {posts.map((post, index) => (
          <div key={index} style={{ display: "flex", gap: "15px", marginBottom: "20px", border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
            <img src={post.preview} alt="p" style={{ width: "150px", height: "150px", objectFit: "cover" }} />
            
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input type="text" placeholder="Title" value={post.title} onChange={(e) => handleChange(index, "title", e.target.value)} />
              <input type="text" placeholder="Category" value={post.category} onChange={(e) => handleChange(index, "category", e.target.value)} />
              <input type="text" placeholder="Sub-Category" value={post.subCategory} onChange={(e) => handleChange(index, "subCategory", e.target.value)} />
              <input type="text" placeholder="Language" value={post.language} onChange={(e) => handleChange(index, "language", e.target.value)} />
              <input type="text" placeholder="Keywords" value={post.keywords} onChange={(e) => handleChange(index, "keywords", e.target.value)} style={{ gridColumn: "span 2" }} />
              <textarea placeholder="Description" value={post.description} onChange={(e) => handleChange(index, "description", e.target.value)} style={{ gridColumn: "span 2" }} />
            </div>
          </div>
        ))}
      </div>

      {posts.length > 0 && (
        <button onClick={handleUpload} disabled={uploading} style={{ width: "100%", padding: "15px", background: "green", color: "white", fontSize: "18px" }}>
          {uploading ? "Uploading..." : `Upload ${posts.length} Posts to Firestore`}
        </button>
      )}
    </div>
  );
}