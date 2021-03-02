var express = require('express');
app = express();
var bodyParser = require('body-parser')
const path = require("path");
var firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
require("firebase/storage")
var admin = require("./admin");
const querystring = require('querystring')
global.XMLHttpRequest = require("xhr2")




//var serviceAccount = require("./service-account-file.json");
let ownedBooks = []

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
const storage = firebase.storage();

app.engine('.html',require('ejs').renderFile)
app.set('views',__dirname + '/views');
app.set('view engine', 'html');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(__dirname+'/public'));

var credentials;
app.get("/", function(req,res){
    res.render("index");
});
app.get("/userPDFReader",function(req,res){
    res.render("userPDFReader")
});
app.get("/admin",function(req,res){
    res.render("admin")
});

app.get("/userAvailableBooks",function(req,res){
  id = req.query.uid
  res.render("userAvailableBooks", {id: id})
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
      res.render("userAvailableBooks", {id: user.uid});
      
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
  let id = req.query.uid
  ownedBooks = [];
  let userFirestore = db.collection("Users").doc(id);
      userFirestore.get().then((books) =>{
      processes = [];
      var data = books.get("ebooks");
      var counter = 0;
        for(var key in data){
          if (data.hasOwnProperty(key) ){
            let userBooks = db.collection("Books").doc(key);
            processes.push(userBooks.get().then((title)=>{
            var booktitle = title.get("title")
            ownedBooks.push([])
            ownedBooks[counter][0] = key
            ownedBooks[counter++][1] = booktitle
            }))
          }
        }
        Promise.all(processes).then(function(){
          res.send(ownedBooks)
        });
      });
});
app.get("/credentials",function(req,res){
  let id = req.query.uid
  userCredentials = [];
  let userFirestore = db.collection("Users").doc(id);
  userFirestore.get().then((credentials) =>{
    userCredentials.push([])
    userCredentials[0][0] = "Country: "
    userCredentials[0][1] = credentials.get("country")
    userCredentials.push([])
    userCredentials[1][0] = "Age: "
    userCredentials[1][1] = credentials.get("age")
    userCredentials.push([])
    userCredentials[2][0] = "Gender: "
    userCredentials[2][1] = credentials.get("gender")
    res.send(userCredentials);
  });
});
app.get("/getBook",function(req,res){
  let book = req.query.book
  let id = req.query.uid
  console.log(book)
  let storageRef = storage.ref(book + ".pdf")
  storageRef.getDownloadURL().then((url)=>{
    console.log(url)
    let userFirestore = db.collection("Users").doc(id)
    userFirestore.get().then((books)=>{
      var data = books.get("ebooks");
      for(let [key,value] of Object.entries(data)){
        bookString = book.toString()
        if(bookString.trim().localeCompare(key.trim()) == 0){
          console.log(key+':'+value);
          res.render("userPDFReader",{pageNumber: value, pdfURL: url, id: id, book: book})
          
        }
      }
    })
  })

  console.log(book);
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
    }).catch((err)=>{
      console.log(err)
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

app.post("/booksDelete",function(req,res){
  processes = []
  for(i = 0; i<req.body.length;i++){
    let userFirestore = db.collection("Books").doc(req.body[i])
    var pdfDelete = req.body[i];
    userFirestore.get().then((doc)=>{
      admin.bucket.file(pdfDelete+".pdf").delete();
      processes.push(userFirestore.delete())
    })
  }
  var wait = setInterval(function(){
    if(processes.length === req.body.length){
      console.log(processes)
      Promise.all(processes).then(res.send.bind(res))
      for(i = 0; i< req.body.length;i++){
        console.log(req.body[i])
      }
      clearInterval(wait)
    }
  },500)
   
   
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


app.listen(4000,function(){
    console.log("Server is running");
});
