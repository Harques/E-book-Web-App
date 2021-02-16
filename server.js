var express = require('express');
app = express();
const path = require("path");
var bodyParser = require('body-parser');
var firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
//var serviceAccount = require("./service-account-file.json");

var firebaseConfig = {
  apiKey: "AIzaSyB8qtYqUk95tgv1dtIp1e-VUayLgaomHYU",
  authDomain: "e-book-app-e4ef1.firebaseapp.com",
  projectId: "e-book-app-e4ef1",
  storageBucket: "e-book-app-e4ef1.appspot.com",
  messagingSenderId: "880958040339",
  appId: "1:880958040339:web:61d49a751c03b2e6ab52e6",
  measurementId: "G-MKN3EDRVNM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

app.engine('.html',require('ejs').renderFile)
app.set('views',__dirname + '/views');
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/public'));

var credentials;
app.get("/", function(req,res){
    res.render("index");
    db.collection("Users").doc().set({farkmaz: "naber"});
})
app.get("/intoLogin",function(req,res){
    res.render("login");
})
app.post("/login",function(req,res){
    console.log("naber");
    console.log(req.body.email);
    console.log(req.body.pass);
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.pass)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      console.log("Girdim ya sakin");
      res.send("Girdim abi sağol")
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      res.send("giremedim abi")
      console.log("Giremeeeeediiiiiiiiim");
    });

});
app.get("/intoCreate",function(req,res){
  res.render("create")
});

app.post("/create",function(req,res) {
  console.log(req.body.email);
  console.log(req.body.password);
  console.log(req.body.country);
  console.log(req.body.gender);
  auth.createUserWithEmailAndPassword(req.body.email, req.body.password)
    .then((userCredential) => {
      // Signed in 
      var user = userCredential.user;
      credentials = userCredential.user;
      console.log(user.uid);
      const userData = {
        age: req.body.age,
        country: req.body.country,
        ebooks: new Map(),
        language: req.body.language,
        email: req.body.email,
        gender: req.body.gender,
        userId: user.uid
    }
      console.log("geldim");
      db.collection("Users").doc(user.uid).set(userData).then(()=>{
        console.log("oldu")
      }).catch(() =>{
        console.log("olmadı")
      });
      //firebase.firestore().collection("Users").doc(user.uid).set(userData);
        
      
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ..
    });

})

app.listen(4000,function(){
    console.log("Server is running");
});
