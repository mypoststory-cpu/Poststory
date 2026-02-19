package com.yourapp.whatsappshare;

import android.content.Intent;
import android.content.pm.PackageManager;
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

            File imageFile = new File(path);
            Uri imageUri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                imageFile
            );

            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("image/png");
            intent.putExtra(Intent.EXTRA_STREAM, imageUri);
            intent.putExtra(Intent.EXTRA_TEXT, message);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            boolean appFound = false;
            PackageManager pm = getContext().getPackageManager();

        
            if ("whatsapp".equals(platform)) {
             
                String[] whatsappPackages = {"com.whatsapp", "com.whatsapp.w4b"};
                for (String pkg : whatsappPackages) {
                    try {
                        pm.getPackageInfo(pkg, PackageManager.GET_ACTIVITIES);
                        intent.setPackage(pkg);
                        appFound = true;
                        break;
                    } catch (PackageManager.NameNotFoundException ignored) {}
                }
            } else if ("instagram".equals(platform)) {
                intent.setPackage("com.instagram.android");
                appFound = isAppInstalled("com.instagram.android");
            } else if ("facebook".equals(platform)) {
                intent.setPackage("com.facebook.katana");
                appFound = isAppInstalled("com.facebook.katana");
            }

            if (appFound || platform == null) {
                getActivity().startActivity(intent);
                call.resolve();
            } else {
                call.reject(platform + "Not installed .");
            }
 
        } catch (Exception e) {
            call.reject("Share failed: " + e.getMessage());
        }
    }

    private boolean isAppInstalled(String packageName) {
        try {
            getContext().getPackageManager().getPackageInfo(packageName, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }
}