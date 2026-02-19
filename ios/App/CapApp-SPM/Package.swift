// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.0.2"),
        .package(name: "CapacitorFilesystem", path: "..\..\..\node_modules\@capacitor\filesystem"),
        .package(name: "CapacitorShare", path: "..\..\..\node_modules\@capacitor\share"),
        .package(name: "WhatsappShare", path: "..\..\..\whatsapp-share"),
        .package(name: "CordovaPluginXSocialsharing", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginXSocialsharing"),
        .package(name: "Es6PromisePlugin", path: "../../capacitor-cordova-ios-plugins/sources/Es6PromisePlugin")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorShare", package: "CapacitorShare"),
                .product(name: "WhatsappShare", package: "WhatsappShare"),
                .product(name: "CordovaPluginXSocialsharing", package: "CordovaPluginXSocialsharing"),
                .product(name: "Es6PromisePlugin", package: "Es6PromisePlugin")
            ]
        )
    ]
)
