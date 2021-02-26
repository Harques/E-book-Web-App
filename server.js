var express = require('express');
app = express();
var bodyParser = require('body-parser')
const path = require("path");
var firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
const bcrypt = require("bcrypt");
var admin = require("./admin");
let alert = require('alert');


//var serviceAccount = require("./service-account-file.json");
let ownedBooks = []

var userID;
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
const bucket = admin.bucket;

app.engine('.html',require('ejs').renderFile)
app.set('views',__dirname + '/views');
app.set('view engine', 'html');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(__dirname+'/public'));

var credentials;
app.get("/", function(req,res){
    res.render("index");
    //db.collection("Users").doc().set({farkmaz: "naber"});
});
app.get("/userPDFReader",function(req,res){
    res.render("userPDFReader")
});
app.get("/admin",function(req,res){
    res.render("admin")
});

app.get("/userAvailableBooks",function(req,res){
  res.render("userAvailableBooks")
});

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
      userID = user.uid;
      console.log(userID);
      res.render("userPDFReader");
      
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
app.get("/library",function(req,res){
  ownedBooks = [];
  let userFirestore = db.collection("Users").doc(userID);
      userFirestore.get().then((books) =>{
      var data = books.get("ebooks");
        for(var key in data){
          if (data.hasOwnProperty(key) ){
            ownedBooks.push(key);
          }
        }
        res.send(ownedBooks);
      });
});
app.get("/credentials",function(req,res){
  let userFirestore = db.collection("Users").doc(userID);
  userFirestore.get().then((credentials) =>{
    console.log(credentials.data())
    res.send(credentials.data());
  });
});
app.get("/adminListing",function(req,res){
  const documents = [];
  let userFirestore = db.collection("Admins")
  var counter = 0;
  userFirestore.get().then((querySnapshot)=>{
    querySnapshot.forEach((userDoc) => {
      documents.push([])
      documents[counter][0] = userDoc.id
      console.log(userDoc.data())
      documents[counter++][1] = userDoc.data()
    })
    res.send(documents)
  })
})
app.get("/booksListing",function(req,res){
  const documents = [];
  let userFirestore = db.collection("Books")
  var counter = 0;
  userFirestore.get().then((querySnapshot)=>{
    querySnapshot.forEach((userDoc) => {
      documents[counter++] = userDoc.data()
      console.log(userDoc.data())
    })
    res.send(documents)
  })
})
app.get("/userListing",function(req,res){
  const documents = [];
  let userFirestore = db.collection("Users")
  var counter = 0;
  userFirestore.get().then((querySnapshot)=>{
    querySnapshot.forEach((userDoc) => {
      console.log(userDoc.data())
      documents[counter++] = userDoc.data()
    })
    res.send(documents)
  })
    
});

app.post("/bookNew",function(req,res){
  res.render("bookNew")
});

app.post("/adminlogin",function(req,res){
  try{
    let userFirestore = db.collection("Admins").doc(req.body.username);
    userFirestore.get().then((password) =>{
    var data = password.get("password");
      if(data == req.body.pass){
        res.render("adminBackend");
      }
    });
  }
  catch{
    res.send(err);
  }

});

app.post("/adminDelete",function(req,res){
  processes = []
  for(i = 0; i<req.body.length;i++){
    let userFirestore = db.collection("Admins").doc(req.body[i])
    processes.push(userFirestore.delete())
  }
  Promise.all(processes).then(res.send.bind(res))
  for(i = 0; i< req.body.length;i++){
    console.log(req.body[i])
  } 
   
});

app.post("/adminUserList",function(req,res){
  res.render("adminUserList")

});
app.post("/adminBackend",function(req,res){
  res.render("adminBackend")
});
app.post("/adminEbooksList",function(req,res){
  res.render("adminEbooksList")
});
app.post("/adminAdminList",function(req,res){
  res.render("adminAdminList")
});
app.post("/adminNew",function(req,res){
  res.render("adminNew")
});
app.post("/adminEdit",function(req,res){
  res.render("adminEdit")
});
app.post("/adminNewAccount",function(req,res){
  console.log(req.body.user)
  let userFirestore = db.collection("Admins").doc(req.body.user);
  const getDoc = userFirestore.get().then((doc)=>{
    console.log(doc.exists)
    if(doc.exists){
      console.log("girdi")
      res.status(409).send("User exists") 
    }
    else{
    var adminData ={
      password: req.body.password
    };
    userFirestore.set(adminData).then(res.send("OK"));
  }
  })

  
});

app.post("/adminEditAccount",function(req,res){
  console.log(req.body.user)
  let userFirestore = db.collection("Admins").doc(req.body.user);
  const getDoc = userFirestore.get().then((doc)=>{
    console.log(doc.exists)
    if(!doc.exists){
      console.log("girdi")
      res.status(409).send("User does not exist") 
    }
    else{
    var adminData ={
      password: req.body.password
    };
    userFirestore.update(adminData).then(res.send("OK"));
  }
  })

  
});


app.post("/create", function(req,res){
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
      var userData = {
        age: req.body.age.toString(),
        country: req.body.country.toString(),
        ebooks: {},
        email: req.body.email.toString(),
        gender: req.body.gender.toString(),
        userId: user.uid
    }
    db.collection("Users").doc(userData.userId).set(userData).then(()=>{
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

app.post('/bookNewFile',(req, res) => {
  console.log(req.body);
  console.log(req.body.file);
  console.log(req.body.language);
  if(!req.body.file) {
      res.status(400).send("Error: No files found")
  
  }
  else if(req.body.file.split('.').pop() != "pdf"){
      res.status(400).send("Error: File is not acceptable.");
  }
  /*else if(firebase.bucket.file(req.body.file).exists()){
      res.status(400).send("Error: File already exists in the server.");
  }*/
  else {
          var book = req.body.file.split(".");
          book.pop();
          const blob = bucket.file(req.body.file)
          
          const blobWriter = blob.createWriteStream({
              metadata: {
                  contentType: req.body.file.mimetype
              }
          })
          
          blobWriter.on('error', (err) => {
              console.log(err)
          })
          
          blobWriter.on('finish', () => {
              res.status(200).send("File uploaded.")
          })
          
          blobWriter.end(req.body.file.buffer)

          var documentID = ""
          var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"]
          for (i = 0; i<20; i++){
            var index = Math.floor(Math.random()*36)
            documentID += letters[index];
          }
          const bookData = {
            id: documentID,
            language: req.body.language,
            title: book.join()
        }
          db.collection("Books").doc(documentID).set(bookData);
          

      
  }
})

app.listen(4000,function(){
    console.log("Server is running");
});
