@echo off
echo ==============================================
echo  Starting AI Finance Mobile App (Expo)
echo ==============================================

cd apps\mobile

echo Starting Expo server...
set EXPO_NO_TELEMETRY=1
set EXPO_OFFLINE=
set EXPO_NO_DEPENDENCY_VALIDATION=1
echo Setting up ADB reverse proxy for Android USB/Emulator...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:3001 tcp:3001
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8000 tcp:8000
echo ========================================================
echo                 !!! IMPORTANT !!! 
echo   DO NOT PRESS "A" IN THIS TERMINAL. 
echo   PRESSING "A" WILL CRASH THE SERVER ON WINDOWS.
echo   OPEN EXPO GO ON YOUR PHONE AND SCAN THE QR CODE!
echo ========================================================
npx expo start --clear
