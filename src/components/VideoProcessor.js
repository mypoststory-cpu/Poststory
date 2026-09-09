import { useState } from 'react';

export default function useVideoProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const burnSignatureToVideo = async (videoRef, signatureUrl, userPhotoUrl, userData, currentSigId) => {
    return new Promise((resolve, reject) => {
      try {
        setIsProcessing(true);
        setProgress(10);

        const video = videoRef.current;
        if (!video) throw new Error("Video element not found!");

        video.muted = true;
        video.playsInline = true;
        video.currentTime = 0;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
      const canvasWidth = Math.min(video.videoWidth || 720, 720);
        const canvasHeight = (canvasWidth / (video.videoWidth || 720)) * (video.videoHeight || 720);
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

       const videoStream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
        const canvasStream = canvas.captureStream(25);
        const audioTracks = videoStream.getAudioTracks();
        
        if (audioTracks.length > 0) {
          canvasStream.addTrack(audioTracks[0]);
        }
       const loadImage = (url) => new Promise((res) => {
          if (!url) return res(null);
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = url.includes('?') ? `${url}&cbv=${Date.now()}` : `${url}?cbv=${Date.now()}`;
          img.onload = () => res(img);
          img.onerror = () => res(null);
        });

       Promise.all([
          loadImage(signatureUrl), 
          loadImage(userPhotoUrl),
          loadImage(userData?.userSignature)
        ]).then(([sigImg, avImg, userSigImg]) => {
          setProgress(35);

          const recorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm;codecs=vp8,opus' });
          const chunks = [];

          recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
          
          let animationFrameId = null;

          recorder.onstop = () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            const blob = new Blob(chunks, { type: 'video/webm' });
            setProgress(100);
            setIsProcessing(false);
            resolve(URL.createObjectURL(blob));
          };

          const getLayoutCoordinates = (sigId) => {
              let avatar = { show: false, x: 0, y: 0, size: 0 };
              let text = { x: canvasWidth / 2, y: canvasHeight - 30, align: "center", nameFont: "bold 24px sans-serif", subFont: "18px sans-serif" };

              const cleanId = sigId.toLowerCase();
              const isPolitical = /^(bjp|shiv|ajit|ubt|inc|sharad|mns|vba|bva|pwp|aimim|sp|rpi|prahar|rsp|shivsena|congress)/.test(cleanId);

              if (cleanId === "sig2") {
                  avatar.show = true;
                  avatar.size = canvasHeight * 0.146; 
                  avatar.x = canvasWidth - (canvasWidth * 0.09) - avatar.size; 
                  avatar.y = canvasHeight - (canvasHeight * 0.02) - avatar.size; 
              } 
              else if (isPolitical && (cleanId.endsWith("1") || cleanId.endsWith("3"))) {
                  avatar.show = true;

                  if (cleanId.endsWith("3")) {
                      avatar.size = canvasHeight * 0.116; 
                      avatar.x = canvasWidth - (canvasWidth * 0.09) - avatar.size; 
                      avatar.y = canvasHeight - (canvasHeight * 0.04) - avatar.size; 
                  }
                  else if (cleanId.endsWith("1")) {
                      avatar.size = canvasHeight * 0.116; 
                      avatar.x = canvasWidth - (canvasWidth * 0.10) - avatar.size; 
                      avatar.y = canvasHeight - (canvasHeight * 0.04) - avatar.size; 
                  }
              }

              if (cleanId.includes("sig2")) {
                  text.align = "left";
                  text.x = canvasWidth * 0.08; 
                  text.y = canvasHeight - (canvasHeight * 0.09); 
                  text.nameFont = `bold ${Math.round(canvasWidth * 0.034)}px sans-serif`;
                  text.subFont = `${Math.round(canvasWidth * 0.026)}px sans-serif`;
              } 
              else if (isPolitical) {
                  text.align = "left";
                  text.x = canvasWidth * 0.06; 
                  
                  if (cleanId.endsWith("1")) {
                      text.y = canvasHeight - (canvasHeight * 0.06); 
                  } else if (cleanId.endsWith("3")) {
                      text.y = canvasHeight - (canvasHeight * 0.09); 
                  } else if (cleanId.endsWith("2")) {
                      text.y = canvasHeight - (canvasHeight * 0.08); 
                  }
                  
                  text.nameFont = `bold ${Math.round(canvasWidth * 0.034)}px sans-serif`;
                  text.subFont = `${Math.round(canvasWidth * 0.026)}px sans-serif`;
              }
              else if (["sig4", "sig5", "sig6"].some(id => cleanId.includes(id))) {
                  text.align = "center";
                  text.x = canvasWidth / 2;
                  text.y = canvasHeight - (canvasHeight * 0.07);
                  text.nameFont = `bold ${Math.round(canvasWidth * 0.024)}px sans-serif`;
                  text.subFont = "0px sans-serif";
              }
              else {
                  // Standard/Sig1 flow
                  text.align = "center";
                  text.x = canvasWidth / 2;
                  text.y = cleanId.includes("sig3") ? canvasHeight - (canvasHeight * 0.05) : canvasHeight - (canvasHeight * 0.09);
                  text.nameFont = `bold ${Math.round(canvasWidth * 0.034)}px sans-serif`;
                  text.subFont = `${Math.round(canvasWidth * 0.026)}px sans-serif`;
              }

              return { avatar, text };
          };

          const layout = getLayoutCoordinates(currentSigId);

          video.onended = () => {
            if (recorder.state === "recording") recorder.stop();
          };

          recorder.start();
          video.play().catch(err => console.warn("Autoplay block handle:", err));

          const drawFrame = () => {
            if (video.ended || video.currentTime >= video.duration) {
              if (recorder.state === "recording") recorder.stop();
              return;
            }

            ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
            if (sigImg) ctx.drawImage(sigImg, 0, 0, canvasWidth, canvasHeight);

            const cleanId = currentSigId.toLowerCase();
            const forceShowAvatar = layout.avatar.show;

            if (forceShowAvatar) {
              ctx.save();
              const finalSize = layout.avatar.size || (canvasHeight * 0.116);
              const finalX = layout.avatar.x || (canvasWidth - (canvasWidth * 0.10) - finalSize);
              const finalY = layout.avatar.y || (canvasHeight - (canvasHeight * 0.10) - finalSize);

              ctx.beginPath();
              ctx.arc(finalX + finalSize / 2, finalY + finalSize / 2, finalSize / 2, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              
              if (avImg) {
                ctx.drawImage(avImg, finalX, finalY, finalSize, finalSize);
              } else {
                ctx.fillStyle = "#FFFFFF";
                ctx.fill();
              }
              ctx.restore();
              
              ctx.save();
              ctx.beginPath();
              ctx.arc(finalX + finalSize / 2, finalY + finalSize / 2, finalSize / 2, 0, Math.PI * 2);
              ctx.lineWidth = Math.max(2, canvasWidth * 0.005);
              ctx.strokeStyle = "#000000";
              ctx.stroke();
              ctx.restore();
            }

            ctx.save();
            ctx.textAlign = layout.text.align;
            
            let currentTextY = layout.text.y;
            let currentSubFont = layout.text.subFont;
            let subtitleOffset = Math.round(canvasHeight * 0.025); 

            if (cleanId.endsWith("1")) {
          
              currentTextY = canvasHeight - (canvasHeight * 0.065); 
              
 
              subtitleOffset = Math.round(canvasWidth * 0.025); 
            }

           
            ctx.fillStyle = cleanId.includes("sig6") ? "#000000" : "#FFFFFF";
            ctx.font = layout.text.nameFont;
            ctx.fillText(userData.name || "", layout.text.x, currentTextY);

   
            if (currentSubFont !== "0px sans-serif") {
              ctx.fillStyle = cleanId.includes("sig6") ? "rgba(0,0,0,0.7)" : "#D3D3D3";
              ctx.font = currentSubFont;
              ctx.fillText(userData.subtitle || "", layout.text.x, currentTextY + subtitleOffset);
            }
            ctx.restore();

            if (userSigImg) {
              const sigWidth = canvasWidth * 0.16;
              const sigHeight = sigWidth * (userSigImg.height / userSigImg.width);
              const sigX = canvasWidth - sigWidth - (canvasWidth * 0.05);
              const sigY = canvasHeight - sigHeight - (canvasHeight * 0.05);
              
              ctx.save();
              ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
              ctx.shadowBlur = 4;
              ctx.drawImage(userSigImg, sigX, sigY, sigWidth, sigHeight);
              ctx.restore();
            }

            const pct = Math.min(99, 35 + Math.round((video.currentTime / (video.duration || 1)) * 64));
            setProgress(isNaN(pct) ? 40 : pct);

           setTimeout(() => {
  animationFrameId = requestAnimationFrame(drawFrame);
}, 40);
          };

          drawFrame();
        });

      } catch (err) {
        setIsProcessing(false);
        reject(err);
      }
    });
  };

  return { burnSignatureToVideo, isProcessing, progress };
}