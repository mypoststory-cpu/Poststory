import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig"; 
// Update path to your firebaseConfig if needed

// --- Existing function ---
export const canAccessFeature = (userPlan, featureKey) => {
  if (userPlan === 'pro') return true; // Pro users have access to everything

  // Define restricted features for Free users
  const restrictedForFree = {
    videoLibrary: true,
    politicalKits: true,
    socialMediaPlatforms: true, // Only allow WhatsApp for free
    highResolution: true
  };

  // If the feature is restricted for free, return false
  if (restrictedForFree[featureKey]) {
    return false;
  }

  return true;
};

// --- 👉 NEW: Invoice Generation Function ---
export const generateInvoiceOnPayment = async (userId, mobile, email, planName, amountPaid, transactionId) => {
    try {
        const invoiceData = {
            userId: userId,
            mobile: mobile,
            email: email,
            planName: planName,
            amount: amountPaid,
            transactionId: transactionId,
            date: serverTimestamp(),
            invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`
        };

        const docRef = await addDoc(collection(db, "invoices"), invoiceData);
        console.log("Invoice generated with ID: ", docRef.id);
        
        // Construct a sample web link to the invoice (or your app's invoice view route)
        const invoiceUrl = `${window.location.origin}/invoice/${docRef.id}`;
        
        return { success: true, invoiceId: docRef.id, invoiceUrl };
    } catch (error) {
        console.error("Error generating invoice: ", error);
        return { success: false };
    }
};

// --- 👉 NEW: Invoice Share Function (SMS & Email) ---
export const handleShareInvoice = (invoiceUrl, userMobile, userEmail) => {
    const message = `Here is your subscription invoice link: ${invoiceUrl}`;

    // 1. Try native mobile share if available
    if (navigator.share) {
        navigator.share({
            title: 'Subscription Invoice',
            text: message,
            url: invoiceUrl,
        }).catch((error) => console.log('Sharing failed', error));
    } else {
        // Fallback: Copy link to clipboard
        navigator.clipboard.writeText(invoiceUrl);
        alert("Invoice link copied to clipboard!");
    }

    // 2. Trigger Mobile SMS client with prefilled body
    if (userMobile) {
        const smsUrl = `sms:${userMobile}?body=${encodeURIComponent(message)}`;
        window.open(smsUrl, '_blank');
    }

    // 3. Trigger Email client with prefilled subject and body
    if (userEmail) {
        const emailSubject = encodeURIComponent("Your Subscription Invoice");
        const emailBody = encodeURIComponent(`Hello,\n\nThank you for your subscription. You can view and download your invoice here: ${invoiceUrl}\n\nRegards,\nYour App Team`);
        const mailtoUrl = `mailto:${userEmail}?subject=${emailSubject}&body=${emailBody}`;
        window.open(mailtoUrl, '_blank');
    }
};