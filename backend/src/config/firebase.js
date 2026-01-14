const admin = require("firebase-admin");
const env = require("./env");

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: env.FIREBASE.PROJECT_ID,
        clientEmail: env.FIREBASE.CLIENT_EMAIL,
        privateKey: env.FIREBASE.PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
});

module.exports = admin;
