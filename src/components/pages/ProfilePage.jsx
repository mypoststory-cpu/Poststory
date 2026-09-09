import React, { useState, useEffect } from "react";
import "../styles/ProfilePage.css";
import Navbar from "../Navbar"; 
import backArrow from "../../assets/lefta.png";
import defaultProfileImg from "../../assets/camera.png";
import icon from "../../assets/edit.png";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "../../firebaseConfig"; //

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "", surname: "", email: "", city: "", state: "", dob: "", mobile: ""
  });

useEffect(() => {
  const savedData = JSON.parse(localStorage.getItem("userData"));
  if (savedData) {
    setFormData({
      name: savedData.name || "",
      surname: savedData.surname || "",
      email: savedData.email || "",
      city: savedData.city || "",
      mobile: savedData.mobile || ""
    });
    setProfileImage(savedData.profileImage || null);
  }
}, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    
    localStorage.setItem("userData", JSON.stringify(formData));
    alert("Profile Updated Successfully!");
    window.location.reload(); 
  };

  const handleImageUpload = async (file) => {
    const savedUser = JSON.parse(localStorage.getItem("userData"));
    if (!savedUser?.mobile) return;

    try {

        const storageRef = ref(storage, `profile_images/${savedUser.mobile}`);
  
        await uploadBytes(storageRef, file);
        

        const downloadURL = await getDownloadURL(storageRef);

  
        const userDocRef = doc(db, "users", savedUser.mobile);
        await updateDoc(userDocRef, {
            profileImage: downloadURL
        });

        
        const updatedUserData = { ...savedUser, profileImage: downloadURL };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));

        alert("Save Profile! ✅");
    } catch (error) {
        console.error("Error:", error);
    }
};
  return (
    <div className="profile-container">
      <Navbar />

      <div className="profile-header">
         <img src={backArrow} alt="back" className="back-icon6" onClick={() => window.history.back()} />
                
        <h3>Profile</h3>
      </div>

    <div className="profile-content">
        <div className="avatar-section">
          <label htmlFor="imageUpload">
            <div className="avatar-glow">
             <div className="avatar-circle">
               
                <img 
                  src={profileImage || defaultProfileImg} 
                  alt="profile" 
                  className="profile-preview-img" 
                />
           { /*    <img src={icon} alt="edit icon" className="edit"/>*/}
              </div>
           
            </div>
          </label>
          <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </div>

        <div className="profile-form">
          <input type="text" name="name" value={formData.name} placeholder="Name" onChange={handleChange} />
          <input type="text" name="surname" value={formData.surname} placeholder="Surname" onChange={handleChange} />
          <input type="email" name="email" value={formData.email} placeholder="Email" onChange={handleChange} />
          <input type="text" name="city" value={formData.city} placeholder="City" onChange={handleChange} />
          <input type="tel" name="mobile" value={formData.mobile} placeholder="Mobile" onChange={handleChange} />
          <button className="profile-save-btn" onClick={handleSave}>SAVE</button>
        </div>
      </div>
    </div>
  );
}