import html2canvas from "html2canvas";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { registerPlugin } from "@capacitor/core";
import { Share } from '@capacitor/share';

const WhatsappShare = registerPlugin("WhatsappShare");

// shareService.js

export const sharePost = async (postRef, message, platform, originalFileUrl = null) => {
  try {
    let base64Data = "";
    let fileName = `post_${Date.now()}.png`;

    const canvas = await html2canvas(postRef.current, {
      scale: 3.0,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 0, 
      onclone: (clonedDoc) => {
        const clonedCard = clonedDoc.querySelector(".preview-card");
        if (clonedCard) {
          clonedCard.style.borderRadius = "0";
          clonedCard.style.boxShadow = "none";
        }
      }
    });

    if (!canvas) throw new Error("Image Generate error");

    base64Data = canvas.toDataURL("image/png").split(",")[1];
    if (!base64Data) throw new Error("Image not convert.");

    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    const fileUri = await Filesystem.getUri({
      directory: Directory.Cache,
      path: fileName
    });

    if ((platform === "instagram" || platform === "facebook") && message) {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(message);
        }
      } catch (err) {
        console.log("Clipboard write missed:", err);
      }
    }

    let cleanPath = fileUri.uri.replace("file://", "");

    if (platform === "whatsapp") {
      await WhatsappShare.shareImage({
        path: cleanPath,
        message: message || "", 
        platform: "whatsapp", 
      });
    } 
    else if (platform === "instagram") {
      await WhatsappShare.shareImage({
        path: cleanPath,
        message: "",
        platform: "instagram", 
      });
    }
    else if (platform === "facebook") {
      await WhatsappShare.shareImage({
        path: cleanPath,
        message: "",
        platform: "facebook", 
      });
    }

  } catch (e) {
    console.error("Capture Error:", e);
   
    try {
      await Share.share({
        files: [fileUri.uri],
        type: "image/png"
      });
    } catch (err) {
      alert("Share Error: " + e.message);
    }
  }
};

export const shareVideo = async (message, platform, blobUrl) => {
  let fileUri = null; // Declare in outer scope
  try {
    if (!blobUrl) throw new Error("Processed video URL not found.");

    // 1. Fetch the blob directly
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    // 2. Convert to Base64 (Keep this, but be aware of memory limits for very large files)
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });

    const fileName = `post_video_${Date.now()}.mp4`;

    // 3. Write file
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    fileUri = await Filesystem.getUri({
      directory: Directory.Cache,
      path: fileName,
    });

    let cleanPath = fileUri.uri.replace("file://", "");

    // 4. Platform-specific sharing
    const shareParams = { path: cleanPath, message: message || "", platform };
    
    if (["whatsapp", "instagram", "facebook"].includes(platform)) {
      await WhatsappShare.shareImage(shareParams);
    } else {
      throw new Error("Unsupported platform");
    }

  } catch (e) {
    console.error("Video Share Error:", e);

    // Fallback: Use fileUri from outer scope
    try {
      if (fileUri) {
        await Share.share({
          files: [fileUri.uri],
          title: "Share Video",
          dialogTitle: "Share via",
        });
      } else {
        alert("Failed to prepare video for sharing.");
      }
    } catch (err) {
      alert("Share Failed: " + e.message);
    }
  }
};