import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
 appId: 'com.waifubriscola.app',
    appName: 'WaifuBriscola',
    webDir: 'dist',
    // FIX: Removed deprecated `bundledWebRuntime` property, which is not a valid key in modern CapacitorConfig.
    android: {
        adjustMarginsForEdgeToEdge: 'force'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: "#2c2c2c",
            androidSplashResourceName: "splash",
            androidScaleType: "CENTER_CROP",
            showSpinner: false,
            splashFullScreen: true,
            splashImmersive: true,
        },
    },
};

export default config;