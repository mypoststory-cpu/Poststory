import React, { useState, useEffect } from "react";

export default function InstallApp() {
  const [installEvent, setInstallEvent] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // ❌ Chrome popup थांबवतो
      setInstallEvent(e); // ✅ आपण control घेतो
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;

    installEvent.prompt(); // 👉 install dialog open
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  // ❗ install possible नसेल तर buttonच नको
  if (!installEvent) return null;

  return (
    <button
      onClick={handleInstall}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "14px 24px",
        borderRadius: "30px",
        background: "#0f172a",
        color: "#fff",
        border: "none",
        fontSize: "16px",
        fontWeight: "bold",
        zIndex: 9999
      }}
    >
      Install App
    </button>
  );
}
