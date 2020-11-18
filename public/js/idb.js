const indexDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

// create variable to hold db connection
let db;

// establish a connection to IndexedDB database called 'budget' and set it to version 1
const request = indexDB.open('budget', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = ({ target }) => {
  // save a reference to the database
    let db = target.result;
    // create an object store (table) called `pending`, set it to have an auto incrementing primary key 
    db.createObjectStore("pending", { autoIncrement: true });
};

// upon success
request.onsuccess = ({ target }) => {
   // db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = target.result;
  // check if app is online, if yes run checkDatabase() function to send all local db data to api
    if(navigator.onLine) {
      checkDatabase();
    }
};
  
request.onerror = function(event) {
    console.log("Error - please see the following: " + event.target.errorCode);
};
  // This function will be executed if we attempt to submit and there's no internet connection
function saveRecord(record) {
   // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(["pending"], "readwrite");

    // access the object store
    const save = transaction.objectStore("pending");
     
    // add record with add method
    save.add(record);
}

//run function to add stored data
function checkDatabase() {
  // open a transaction on your db
    const transaction = db.transaction(["pending"], "readwrite");
     // access your object store
    const check = transaction.objectStore("pending");
     // get all records from store and set to a variable
    const getAll = check.getAll();
  // calls function to grab data and store data
    getAll.onsuccess = function() {
      // if there was data, let's send it to the api server
      if(getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => {        
          return response.json();
        })
        .then(() => {
          // open one more transaction
          const transaction = db.transaction(["pending"], "readwrite");
           // access the object
          const save = transaction.objectStore("pending");
          // clear all items
          save.clear();
        });
      }
    };
}
  
// listen for app coming back online-run checkDatabase function
window.addEventListener("online", checkDatabase);