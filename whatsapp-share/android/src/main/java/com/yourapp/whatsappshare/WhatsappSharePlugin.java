package com.yourapp.whatsappshare;

import android.content.Intent;
import android.net.Uri;
import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

@CapacitorPlugin(name = "WhatsappShare")
public class WhatsappSharePlugin extends Plugin {

    @PluginMethod()
    public void shareImage(PluginCall call) {
        try {
            String path = call.getString("path");
            String message = call.getString("message");
            String platform = call.getString("platform");

            if (path == null) {
                call.reject("Image path is missing");
                return;
            }

            File file = new File(path);
            Uri fileUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    file
            );

            // 🔥 [बदल १]: फाईल व्हिडिओ आहे की इमेज हे पाथवरून ओळखणे (Dynamic MIME Type)
            String mimeType = "image/*";
            if (path.toLowerCase().endsWith(".mp4") || path.toLowerCase().endsWith(".mov") || path.toLowerCase().contains("video")) {
                mimeType = "video/*";
            }

            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType(mimeType);
            intent.putExtra(Intent.EXTRA_STREAM, fileUri);
            
            // फक्त व्हॉट्सॲप मेसेज सपोर्ट करते, इन्स्टाग्राम आणि फेसबुक डायरेक्ट टेक्स्ट स्वीकारत नाहीत
            if ("whatsapp".equals(platform) && message != null && !message.isEmpty()) {
                intent.putExtra(Intent.EXTRA_TEXT, message);
            }
            
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            // ✅ WHATSAPP FIX (NO POPUP)
            if ("whatsapp".equals(platform)) {
                String packageName = null;

                if (isAppInstalled("com.whatsapp")) {
                    packageName = "com.whatsapp";
                }
                else if (isAppInstalled("com.whatsapp.w4b")) {
                    packageName = "com.whatsapp.w4b";
                }
                else {
                    call.reject("WhatsApp not installed");
                    return;
                }

                intent.setPackage(packageName);
                getActivity().startActivity(intent);
                call.resolve();
                return; 
            }

            // ✅ INSTAGRAM FIX (थेट ओपन करण्यासाठी अचूक पद्धत)
            if ("instagram".equals(platform)) {
                if (isAppInstalled("com.instagram.android")) {
                    
                    // 🔥 [बदल २]: इन्स्टाग्राम डायरेक्ट ओपन होण्यासाठी 'Feed' किंवा 'Story' पॅकेज मॅपिंग देणे आवश्यक आहे
                    intent.setPackage("com.instagram.android");
                    
                    // जर तुम्हाला थेट इंस्टाग्राम स्टोरीवर शेअर करायचे असेल, तर खालील २ लाईन्स अनकमेंट करा:
                    // intent.setAction("com.instagram.share.ADD_TO_STORY");
                    // intent.putExtra("interactive_asset_uri", fileUri);
                    
                    getActivity().startActivity(intent);
                    call.resolve();
                } else {
                    call.reject("Instagram not installed");
                }
                return;
            }

            // ✅ FACEBOOK FIX
            if ("facebook".equals(platform)) {
                if (isAppInstalled("com.facebook.katana")) {
                    intent.setPackage("com.facebook.katana");
                    getActivity().startActivity(intent);
                    call.resolve();
                } else {
                    call.reject("Facebook not installed");
                }
                return;
            }

            call.reject("Invalid platform");

        } catch (Exception e) {
            call.reject("Share failed: " + e.getMessage());
        }
    }

    private boolean isAppInstalled(String packageName) {
        try {
            getContext().getPackageManager().getPackageInfo(packageName, 0);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}