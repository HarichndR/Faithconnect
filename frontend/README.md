### FaithConnect Frontend (Expo)

#### Configure backend URL

Update `src/config/env.js` with your machine IP so the Expo app can reach the backend from a device/simulator:

```js
const LOCAL_IP = "192.168.x.x"; // your Mac's LAN IP
```

The mobile app expects the backend at port `5050` with base path `/api/v1`.

#### Install & run

```bash
cd frontend
npm install
npx expo start
```

Then:
- Press `i` for iOS simulator, or
- Scan the QR code with the Expo Go app on your device.

#### Auth & roles

- Landing screen lets you choose Worshiper or Religious Leader before registering.
- After register/login, you'll complete a short profile and be taken into the appropriate tab experience.

