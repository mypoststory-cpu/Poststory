const functions = require("firebase-functions");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

function getDb() {
  if (!getApps().length) {
    initializeApp();
  }
  return getFirestore();
}

exports.sendTwilioOTP = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const rawPhone = req.query.phone || req.body.phone;

  if (!rawPhone) {
    return res.status(400).json({ error: "Phone number is required." });
  }

  // Normalize phone format so save and verify always match
  const cleanPhone = rawPhone.startsWith("+") ? rawPhone : "+91" + rawPhone.replace(/\D/g, '').slice(-10);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const db = getDb();
    
    // Save using the standardized cleanPhone key
    await db.collection("otps").doc(cleanPhone).set({
      otp: otpCode,
      createdAt: Date.now(),
    });

    const accountSid = "ACc0ee998735a8cba3d6187caa493eb03a"; 
    const authToken = "bfa618553cc2526ee92d02d334826455";
    const client = require("twilio")(accountSid, authToken);
    
    const twilioPhoneNumber = "+17373471217"; 

    await client.messages.create({
      body: `${otpCode} is your verification code for Post story App`,
      from: twilioPhoneNumber,
      to: cleanPhone, 
    });

    return res.status(200).json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Twilio Error:", error);
    return res.status(500).json({ error: "Failed to send SMS: " + error.message });
  }
});

exports.verifyTwilioOTP = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const rawPhone = req.query.phone || req.body.phone;
  const userOtp = req.query.otp || req.body.otp;

  if (!rawPhone || !userOtp) {
    return res.status(400).json({ error: "Phone number and OTP are required." });
  }

  // Use the exact same normalization logic to match the saved document key
  const cleanPhone = rawPhone.startsWith("+") ? rawPhone : "+91" + rawPhone.replace(/\D/g, '').slice(-10);

  try {
    const db = getDb();
    const docRef = await db.collection("otps").doc(cleanPhone).get();

    if (!docRef.exists) {
      return res.status(400).json({ error: "OTP expired or not found." });
    }

    const data = docRef.data();
    if (data.otp !== userOtp.toString().trim()) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    await db.collection("otps").doc(cleanPhone).delete();

    return res.status(200).json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});