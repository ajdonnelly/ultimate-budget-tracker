const indexDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;


let db;

const request = indexDB.open('budget', 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;
  
    if(navigator.onLine) {
      checkDatabase();
    }
};
  
request.onerror = function(event) {
    console.log("Error - please see the following: " + event.target.errorCode);
};
  
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const save = transaction.objectStore("pending");
    
    save.add(record);
}
  
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const check = transaction.objectStore("pending");
    const getAll = check.getAll();
  // calls function to grab data and store data
    getAll.onsuccess = function() {
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
          const transaction = db.transaction(["pending"], "readwrite");
          const save = transaction.objectStore("pending");
          save.clear();
        });
      }
    };
}
  

window.addEventListener("online", checkDatabase);