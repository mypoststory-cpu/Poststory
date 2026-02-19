import html2canvas from "html2canvas";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { registerPlugin } from "@capacitor/core";

const WhatsappShare = registerPlugin("WhatsappShare");

export const sharePost = async (postRef, message, platform) => {
  try {
const canvas = await html2canvas(postRef.current, {
      scale: 4.5, 
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: true,
      onclone: (clonedDoc) => {
        const clonedCard = clonedDoc.querySelector(".preview-card");
        if (clonedCard) {
        
          clonedCard.style.borderRadius = "0";

    
          const allImgs = clonedCard.querySelectorAll(".main-post-img, .sig-overlay-img");
          allImgs.forEach(img => {
            img.style.zIndex = "1";
          });

    
          const textArea = clonedCard.querySelector(".badge-text-area");
          if (textArea) {
            textArea.style.display = "block !important";
            textArea.style.visibility = "visible !important";
            textArea.style.zIndex = "999"; 
            textArea.style.opacity = "1";
          
            const name = textArea.querySelector(".badge-name");
            const subtitle = textArea.querySelector(".badge-subtitle");
            if(name) {
                name.style.color = "#ffffff";
                name.style.fontWeight = "bold";
            }
            if(subtitle) subtitle.style.color = "#ffffff";
          }

        
          const profile = clonedCard.querySelector(".profile-wrapper");
          if (profile) {
            profile.style.zIndex = "1000";
            profile.style.display = "flex !important";
            profile.style.visibility = "visible !important";
          }
        }
      }
    });
    const base64 = canvas.toDataURL("image/png").split(",")[1];

    const file = await Filesystem.writeFile({
      path: `post_${Date.now()}.png`,
      data: base64,
      directory: Directory.Cache,
    });

    await WhatsappShare.shareImage({
      path: file.uri.replace("file://", ""),
      message,
      platform, // 👈 VERY IMPORTANT
    });

  } catch (e) {
    alert(e.message);
  }
};
