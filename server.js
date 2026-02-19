const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// This makes your 'uploads' folder accessible via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/home-data', (req, res) => {
  res.json({
    trending: [
      { id: 1, img: "/uploads/1.jpg" }, // Adjust extension (.png/.jpg) to match your files
    { id: 2, img: "/uploads/2.jpg" },
    { id: 3, img: "/uploads/3.jpg" },
    { id: 4, img: "/uploads/4.jpg" },
    { id: 5, img: "/uploads/5.jpg" }
    ],
    categories: [
      { id: 1, name: "Daily", img: "/uploads/cat1.png" },
      { id: 2, name: "Devotion", img: "/uploads/cat2.png" },
      { id: 3, name: "Festivals", img: "/uploads/cat3.png" },
      { id: 4, name: "Wishes", img: "/uploads/cat4.png" },
      { id: 5, name: "Thoughts", img: "/uploads/cat5.png" },
      { id: 6, name: "Funny", img: "/uploads/cat6.png" },
      { id: 7, name: "Days", img: "/uploads/cat7.png" },
      { id: 8, name: "Updates", img: "/uploads/cat8.png" },
    ]
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});