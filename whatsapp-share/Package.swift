// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "WhatsappShare",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "WhatsappShare",
            targets: ["WhatsappSharePlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "WhatsappSharePlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/WhatsappSharePlugin"),
        .testTarget(
            name: "WhatsappSharePluginTests",
            dependencies: ["WhatsappSharePlugin"],
            path: "ios/Tests/WhatsappSharePluginTests")
    ]
)