import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import twilio from 'twilio';

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json()); // Essential for parsing JSON bodies from frontend requests

// Twilio Configuration
const accountSid = "ACc0ee998735a8cba3d6187caa493eb03a";
const authToken = "bfa618553cc2526ee92d02d334826455";
const twilioPhoneNumber = "+17373471217";
const client = twilio(accountSid, authToken);

// Temporary in-memory storage for OTPs (or you can use Firestore in backend)
const otpStorage = new Map();

// This makes your 'uploads' folder accessible via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Send OTP Route
app.post('/api/sendTwilioOTP', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  // Generate a random 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const message = await client.messages.create({
      body: `Your verification code for AllezPostStory is: ${otpCode}`,
      from: twilioPhoneNumber,
      to: phone
    });

    console.log(`SMS sent successfully. SID: ${message.sid}`);

    // Store OTP temporarily against the phone number (expires or gets verified)
    otpStorage.set(phone, { otp: otpCode, createdAt: Date.now() });

    res.status(200).json({ 
      success: true, 
      message: "OTP sent successfully via SMS",
      devOtp: otpCode 
    });

  } catch (error) {
    console.error("Twilio Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP Route
app.post('/api/verifyTwilioOTP', async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  const storedData = otpStorage.get(phone);

  if (!storedData) {
    return res.status(400).json({ error: "OTP expired or not found." });
  }

  if (storedData.otp !== otp.trim()) {
    return res.status(400).json({ error: "Invalid OTP entered." });
  }

  // Clear OTP after successful verification
  otpStorage.delete(phone);

  res.status(200).json({ 
    success: true, 
    message: "OTP verified successfully!" 
  });
});

app.get('/api/home-data', (req, res) => {
  res.json({
    trending: [
      { id: 1, img: "/uploads/1.jpg" },
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