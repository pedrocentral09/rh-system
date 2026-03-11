require('dotenv').config();

console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "Set" : "Missing");
console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "Set" : "Missing");
console.log("FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? "Set" : "Missing");
