var express = require('express');
app = express();
var request = require('request');
var bodyParser = require('body-parser')
const path = require("path");
var firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
require("firebase/storage")
var admin = require("./admin");
const querystring = require('querystring');
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


app.get("/", function(req,res){
    res.render("index");
});
app.get("/userPDFReader",function(req,res){
    id = req.query.uid
    res.render("userPDFReader",{id:id})
});
app.get("/admin",function(req,res){
    res.render("admin")
});

app.get("/userAvailableBooks",function(req,res){
  id = req.query.uid
  const documents = [];
  processes = [];
  userOwnedBooks = [];
  let userFirestore = db.collection("Users").doc(id)
  userFirestore.get().then((books)=>{
    var data = books.get("ebooks");
    for(let [key,value] of Object.entries(data)){
      userOwnedBooks.push(key.trim())
    }
    userFirestore = db.collection("Books")
    var counter = 0;
    userFirestore.get().then((querySnapshot)=>{
      querySnapshot.forEach((userDoc) => {
        if(!userOwnedBooks.includes(userDoc.data().id)){
          var storageRef = storage.ref(userDoc.data().id+"cover."+userDoc.data().cover);
          processes.push(storageRef.getDownloadURL().then((download)=>{
            documents.push([])
            documents[counter][0] = userDoc.data().description
            documents[counter][1] = download
            documents[counter][2] = userDoc.data().title
            documents[counter++][3] = userDoc.data().price
          }))
          console.log(userDoc.data())
        }
      })
      Promise.all(processes).then(function(){
        console.log("Documents: " + documents)
        res.render("userAvailableBooks",{id:id, books:documents})
      });
  })
  })
  
});

app.get("/intoLogin",function(req,res){
    res.render("login",{error:false});
});

app.get("/userEditAccount",function(req,res){
  id = req.query.uid
  res.render("userEditAccount",{id:id})
})

app.get("/intoBooks",function(req,res){
  const documents = [];
  processes = [];
  let userFirestore = db.collection("Books")
  var counter = 0;
  userFirestore.get().then((querySnapshot)=>{
    querySnapshot.forEach((userDoc) => {
      documents.push([])
      var storageRef = storage.ref(userDoc.data().id+"cover."+userDoc.data().cover);
      processes.push(storageRef.getDownloadURL().then((download)=>{
        documents[counter][0] = userDoc.data().description
        documents[counter][1] = download
        documents[counter++][2] = userDoc.data().title
      }))
      console.log(userDoc.data())
    })
    Promise.all(processes).then(function(){
      console.log("Documents: " + documents)
      res.render("books",{books:documents})
    });
})

})


app.get("/forgotPassword",function(req,res){
  res.render("forgotPassword")
});

app.post("/login",function(req,res){
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.pass)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      userID = user.uid;
      const documents = [];
      processes = [];
      userOwnedBooks = [];
      let userFirestore = db.collection("Users").doc(user.uid)
      userFirestore.get().then((books)=>{
        var data = books.get("ebooks");
        for(let [key,value] of Object.entries(data)){
          userOwnedBooks.push(key.trim())
        }
        userFirestore = db.collection("Books")
        var counter = 0;
        userFirestore.get().then((querySnapshot)=>{
          querySnapshot.forEach((userDoc) => {
            if(!userOwnedBooks.includes(userDoc.data().id)){
              var storageRef = storage.ref(userDoc.data().id+"cover."+userDoc.data().cover);
              processes.push(storageRef.getDownloadURL().then((download)=>{
                documents.push([])
                documents[counter][0] = userDoc.data().description
                documents[counter][1] = download
                documents[counter][2] = userDoc.data().title
                documents[counter++][3] = userDoc.data().price
              }))
              console.log(userDoc.data())
            }
          })
          Promise.all(processes).then(function(){
            console.log("Documents: " + documents)
            res.render("userAvailableBooks",{id:user.uid, books:documents})
          });
      })
      })
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      res.render("login", {error:true})
    });

});

app.post("/create", function(req,res){
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
    const documents = [];
    processes = [];
    processes.push(db.collection("Users").doc(userData.userId).set(userData))
    let userFirestore = db.collection("Books")
    var counter = 0;
    userFirestore.get().then((querySnapshot)=>{
      querySnapshot.forEach((userDoc) => {
        documents.push([])
        var storageRef = storage.ref(userDoc.data().id+"cover."+userDoc.data().cover);
        processes.push(storageRef.getDownloadURL().then((download)=>{
          documents[counter][0] = userDoc.data().description
          documents[counter][1] = download
          documents[counter][2] = userDoc.data().title
          documents[counter++][3] = userDoc.data().price
        }))
        console.log(userDoc.data())
      })
      Promise.all(processes).then(function(){
        console.log("Documents: " + documents)
        res.render("userAvailableBooks",{id:user.uid, books:documents})
      });
  })
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      res.render("create",{error:true})
      // ..
    });

  

});

app.post("/sendEmail",function(req,res){
  firebase.auth().sendPasswordResetEmail(req.body.email).then(function(){
    res.status(200).send("OK");

  }).catch(function(error){
    var errorCode = error.code;
    var errorMessage = error.message;

    console.log(errorCode);
    console.log(errorMessage);
    res.status(409).send("Failed")
  })
});

app.get("/intoCreate",function(req,res){
  res.render("create",{error:false})
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
            var bookID = title.get("id")
            ownedBooks.push([])
            ownedBooks[counter][0] = bookID
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
    let userFirestore = db.collection("Users").doc(id)
    userFirestore.get().then((books)=>{
      var data = books.get("ebooks");
      for(let [key,value] of Object.entries(data)){
        bookString = book.toString()
        if(bookString.trim().localeCompare(key.trim()) == 0){
          console.log(key+':'+value);
          res.render("userPDFReader",{pageNumber: value+1, pdfURL: url, id: id, book: book})
          
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
        res.render("adminUserList");
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
app.post("/bookEdit",function(req,res){
  res.render("bookEdit")
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
      res.status(409).send("User does not exist") 
    }
    else{
      if(req.body.password == "")
      res.status(410).send("Password is empty")
    var adminData ={
      password: req.body.password
    };
    userFirestore.update(adminData).then(res.send("OK"));
  }
  })

  
});

// Add your credentials:
// Add your client ID and secret
var CLIENT =
  'AUJoKVGO3q1WA1tGgAKRdY6qx0qQNIQ6vl6D3k7y64T4qh5WozIQ7V3dl3iusw5BwXYg_T5FzLCRguP8';
var SECRET =
  'EOw8LNwDhM7esrQ3nHfzKc7xiWnJc83Eawln4YLfUgivfx1LGzu9Mj0F5wlarilXDqdK9Q5aHVo-VGjJ';
var PAYPAL_API = 'https://api-m.sandbox.paypal.com';
  // Set up the payment:
  // 1. Set up a URL to handle requests from the PayPal button
  app.post('/my-api/create-payment/', function(req, res)
  {
    var price = parseFloat(req.body.price);
    // 2. Call /v1/payments/payment to set up the payment
    request.post(PAYPAL_API + '/v1/payments/payment',
    {
      auth:
      {
        user: CLIENT,
        pass: SECRET
      },
      body:
      {
        intent: 'sale',
        payer:
        {
          payment_method: 'paypal'
        },
        transactions: [
        {
          amount:
          {
            total: price,
            currency: 'USD'
          }
        }],
        redirect_urls:
        {
          return_url: 'https://example.com',
          cancel_url: 'https://example.com'
        }
      },
      json: true
    }, function(err, response)
    {
      if (err)
      {
        console.error(err);
        return res.sendStatus(500);
      }
      // 3. Return the payment ID to the client
      res.json(
      {
        id: response.body.id
      });
    });
  })
  // Execute the payment:
  // 1. Set up a URL to handle requests from the PayPal button.
  app.post('/my-api/execute-payment/', function(req, res)
  {
    // 2. Get the payment ID and the payer ID from the request body.
    var paymentID = req.body.paymentID;
    var payerID = req.body.payerID;
    var price = parseFloat(req.body.price);
    // 3. Call /v1/payments/payment/PAY-XXX/execute to finalize the payment.
    request.post(PAYPAL_API + '/v1/payments/payment/' + paymentID +
      '/execute',
      {
        auth:
        {
          user: CLIENT,
          pass: SECRET
        },
        body:
        {
          payer_id: payerID,
          transactions: [
          {
            amount:
            {
              total: price,
              currency: 'USD'
            }
          }]
        },
        json: true
      },
      function(err, response)
      {
        if (err)
        {
          console.error(err);
          return res.sendStatus(500);
        }
        // 4. Return a success response to the client
        res.json(
        {
          status: 'success'
        });
      });
  })
// Run `node ./server.js` in your terminal

app.get("/addBook",function(req,res){
  let title = req.query.title
  let id = req.query.uid
  let bookFirestore = db.collection("Books");
  bookFirestore.where("title", "==", title).get().then((querySnapshot)=>{
    if(querySnapshot.empty){
      console.log("Empty")
      res.send('Error')
    }
    else{
      querySnapshot.forEach((doc)=>{
        console.log(doc.id)
        let userFirestore = db.collection("Users").doc(id)
        userFirestore.get().then((document)=>{
          var data = document.get("ebooks");
          data[doc.id] = 0
          userFirestore.update({ebooks:data}).then(()=>{
              userFirestore.get().then((newDoc) =>{
                res.send('OK')
              })
          })
        })
      })
    } 
  })
})

app.listen(4000,function(){
    console.log("Server is running");
});
