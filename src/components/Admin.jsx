import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
    const [formData, setFormData] = useState({
        category: 'daily',
        tab: 'Good Morning',
        imgUrl: '',
        title: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // तुमचा Node.js सर्वर पोर्ट 5000 वर चालू असायला हवा
            await axios.post('http://localhost:5000/api/posts/add', formData);
            alert("Image डेटाबेसमध्ये सेव्ह झाली!");
            setFormData({ ...formData, imgUrl: '', title: '' }); // फॉर्म रिकामा करण्यासाठी
        } catch (err) {
            console.error(err);
            alert("Error: सर्वर (node server.js) चालू आहे का तपासा!");
        }
    };

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>नवीन इमेज ॲड करा</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: 'auto' }}>
                <input type="text" placeholder="Cloudinary Link इथे टाका" value={formData.imgUrl} 
                    onChange={(e) => setFormData({...formData, imgUrl: e.target.value})} required />
                
                <input type="text" placeholder="इमेजचे नाव (Title)" value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                
                <button type="submit" style={{ cursor: 'pointer', background: 'blue', color: 'white', border: 'none', padding: '10px' }}>
                    डेटाबेसमध्ये पाठवा
                </button>
            </form>
        </div>
    );
};

export default Admin;