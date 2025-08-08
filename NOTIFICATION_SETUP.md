# Notification Setup Guide

## Issue
The `expo-notifications` package is not fully supported in Expo Go with SDK 53+. You'll see warnings like:
```
ERROR expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go with the release of SDK 53.
```

## Solutions

### Option 1: Use Development Build (Recommended)
For full notification functionality, create a development build:

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure your project**:
   ```bash
   eas build:configure
   ```

4. **Create a development build**:
   ```bash
   # For Android
   eas build --profile development --platform android
   
   # For iOS
   eas build --profile development --platform ios
   ```

5. **Install the development build** on your device

6. **Run the development build**:
   ```bash
   npx expo start --dev-client
   ```

### Option 2: Continue with Expo Go (Limited Functionality)
The app has been modified to handle the notification limitation gracefully:

- Notification toggles will be disabled in Expo Go
- A warning message will appear in the settings screen
- The app will continue to work without notification features

## Current Implementation

The app now includes:

1. **Conditional Notification Service**: The `NotificationService` checks if notifications are available and provides appropriate fallbacks
2. **UI Feedback**: The settings screen shows a warning when notifications are not supported
3. **Graceful Degradation**: The app continues to work even without notification support

## Testing Notifications

### In Development Build:
- All notification features work normally
- You can test medication alarms, push notifications, etc.

### In Expo Go:
- Notification features are disabled
- Settings show appropriate warnings
- App functionality remains intact

## Migration Path

1. **For Development**: Use development builds for full functionality
2. **For Production**: Use EAS Build to create production builds with full notification support
3. **For Testing**: Expo Go works for testing other features, but notifications will be limited

## Troubleshooting

If you encounter issues:

1. **Check EAS CLI version**: Ensure you have the latest version
2. **Verify project configuration**: Make sure `eas.json` is properly configured
3. **Check device compatibility**: Ensure your device supports the required features
4. **Review build logs**: Check EAS build logs for any configuration issues

## Next Steps

1. Set up EAS account and configure your project
2. Create development builds for testing
3. Test notification functionality in development builds
4. Prepare for production builds when ready to deploy 