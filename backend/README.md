### FaithConnect Backend

#### Env configuration

Create a `.env` file in `backend` with at least:

```bash
MONGO_URI=mongodb://localhost:27017/faithconnect
JWT_SECRET=super-secret-key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EXPO_PUSH_ENABLED=false
```

These are read via `src/config/env.js`.

#### Install & run

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:3000/api/v1`.

#### Seed sample data

```bash
cd backend
node src/seed.js
```

This creates:
- One leader (`grace@example.com`)
- One worshiper (`ali@example.com`)
- A sample post and chat between them.

