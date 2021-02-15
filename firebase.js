var admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert("./service-account-file.json"),
    storageBucket: "e-book-app-e4ef1.appspot.com"
});
const bucket = admin.storage().bucket();
const db = admin.firestore();

module.exports = {
    bucket,
    db
}