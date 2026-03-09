export const ANDROID_FEATURE_LINES = [
  '<uses-feature android:name="android.hardware.camera.any" android:required="false" />',
  '<uses-feature android:name="android.hardware.microphone" android:required="false" />',
];

export const ANDROID_PERMISSION_LINES = [
  '<uses-permission android:name="android.permission.INTERNET" />',
  '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />',
  '<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />',
  '<uses-permission android:name="android.permission.CAMERA" />',
  '<uses-permission android:name="android.permission.RECORD_AUDIO" />',
  '<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />',
  '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
  '<uses-permission android:name="android.permission.VIBRATE" />',
  '<uses-permission android:name="android.permission.WAKE_LOCK" />',
  '<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />',
  '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />',
  '<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />',
  '<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />',
  '<uses-permission android:name="android.permission.FOREGROUND_SERVICE_PHONE_CALL" />',
  '<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />',
  '<uses-permission android:name="android.permission.READ_CONTACTS" />',
  '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
  '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />',
];

export const IOS_PERMISSION_ENTRIES = [
  ['NSCameraUsageDescription', 'OpenChat needs camera access for video calls, photo upload and QR scanning.'],
  ['NSMicrophoneUsageDescription', 'OpenChat needs microphone access for voice calls, video calls and voice messages.'],
  ['NSPhotoLibraryUsageDescription', 'OpenChat needs photo library access to upload images and videos.'],
  ['NSPhotoLibraryAddUsageDescription', 'OpenChat needs photo library write access to save images and videos.'],
  ['NSContactsUsageDescription', 'OpenChat needs contacts access to match contacts and start calls quickly.'],
  ['NSBluetoothAlwaysUsageDescription', 'OpenChat needs Bluetooth access to connect headsets and audio devices.'],
  ['NSBluetoothPeripheralUsageDescription', 'OpenChat needs Bluetooth access to connect call peripherals and accessories.'],
  ['NSLocalNetworkUsageDescription', 'OpenChat needs local network access for LAN debugging and device discovery.'],
  ['NSFaceIDUsageDescription', 'OpenChat uses Face ID for secure authentication and payment verification.'],
];

export const IOS_BACKGROUND_MODES = ['audio', 'voip', 'remote-notification'];

export const ANDROID_CALL_PERMISSION_BASELINE = [
  'android.permission.CAMERA',
  'android.permission.RECORD_AUDIO',
  'android.permission.MODIFY_AUDIO_SETTINGS',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_CAMERA',
  'android.permission.FOREGROUND_SERVICE_MICROPHONE',
  'android.permission.FOREGROUND_SERVICE_PHONE_CALL',
  'android.permission.BLUETOOTH_CONNECT',
  'android.permission.BLUETOOTH_SCAN',
];

export const ANDROID_COMMON_PERMISSION_BASELINE = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.ACCESS_WIFI_STATE',
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_AUDIO',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_CONTACTS',
];

export const IOS_CALL_PERMISSION_BASELINE = [
  'NSCameraUsageDescription',
  'NSMicrophoneUsageDescription',
  'UIBackgroundModes',
  '<string>audio</string>',
  '<string>voip</string>',
];

export const IOS_COMMON_PERMISSION_BASELINE = [
  'NSPhotoLibraryUsageDescription',
  'NSPhotoLibraryAddUsageDescription',
  'NSContactsUsageDescription',
  'NSBluetoothAlwaysUsageDescription',
  'NSBluetoothPeripheralUsageDescription',
  'NSLocalNetworkUsageDescription',
  '<string>remote-notification</string>',
];
