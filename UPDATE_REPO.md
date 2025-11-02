# Update GitHub Repository

## New Features Added:
1. **System Monitor Tab** - Shows real OS processes and resources
2. **Warning Sound** - Plays when deadlock is detected
3. **Intelligent Chatbot** - Explains any OS concept
4. **Dashboard Improvements** - Clear all simulations button
5. **Auto-resolve Functionality** - Working deadlock resolution
6. **Enhanced Real-time System** - Better process management

## Commands to Update Repository:

```bash
# Navigate to project directory
cd "deadlock project os pbl"

# Add all changes
git add .

# Commit changes
git commit -m "Major update: Added System Monitor, Chatbot, Warning Sounds, and Enhanced Features"

# Push to GitHub
git push origin main
```

## If you need to set up Git (first time):

```bash
# Configure Git (replace with your details)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize repository if not already done
git init

# Add remote origin (replace with your repo URL)
git remote add origin https://github.com/Siddhartha010/-Deadlock-Handler.git

# Then follow the update commands above
```

## New Files Created:
- `frontend/src/pages/SystemMonitor.js`
- `frontend/src/styles/SystemMonitor.css`
- `frontend/src/components/DeadlockChatbot.js`
- `frontend/src/styles/DeadlockChatbot.css`
- `frontend/src/utils/systemApi.js`
- `backend/api/system_api.py`

## Modified Files:
- `frontend/src/App.js` - Added SystemMonitor route
- `frontend/src/components/Header.js` - Added System Monitor tab
- `frontend/src/components/RealTimeSystemSimulator.js` - Added warning sound and chatbot
- `frontend/src/pages/Dashboard.js` - Added clear all button
- `backend/app.py` - Registered system API

Run these commands in your terminal to update your GitHub repository!