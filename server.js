'use strict';

const axios = require('axios');
const express = require('express');
const cron  = require('node-cron');
const nodemailer = require("nodemailer");

const PORT = 8000;
const HOST = '0.0.0.0';

let storeItems = [];

const getItems = async () => {
  
  var data = JSON.stringify({
    "favorites_only": false,
    "origin": {
      "latitude": 50.4495867,
      "longitude": 3.4145197
    },
    "radius": 8,
    "user_id": 60677810
  });

  var config = {
    method: 'post',
    url: 'https://apptoogoodtogo.com/api/item/v7/',
    headers: { 
      'Accept-Language': 'en-US', 
      'User-Agent': 'TooGoodToGo/21.9.0 (813) (iPhone/iPhone 7 (GSM); iOS 15.1; Scale/2.00)', 
      'Authorization': 'Bearer e30.eyJzdWIiOiI2MDY3NzgxMCIsImV4cCI6MTY2MjMzNzAwMiwidCI6IlQxcmZVSWEyVG5LOGpRQ3ZuN3JMUXc6MDoxIn0.N7AN3f2gtTsuzrbdFSyFd8Qomwt9xIjWD5Rj3OsQo04', 
      'Content-Type': 'application/json',
      'Cookie': 'datadome=Uyk.yKYPdqe0ouyWn3a~srCfyw.-sjfk0s.tUv9xVuKOH-m.WFSTF_pM5nutcELBNEfqgU.MztN053qSfUukhNxDoP5MqRZiV1DY-8YsBYx-icE8L1CkV6..VP~XVKj; Path=/; Domain=apptoogoodtogo.com; Secure; Expires=Sun, 03 Sep 2023 00:17:14 GMT;'
    },
    data : data
  };

  const httpCall = await axios(config);
  const response = await JSON.stringify(httpCall.data)
  
  return JSON.parse(response);
    
}

const tgtg = async() => {
  
  const { items } = await getItems();
  
  let newItems = [];
  const oldItems = storeItems;

  //Add items to array
  items.forEach(el => {
    newItems.push({"id": el.store.store_id, "name": el.display_name, "quantity" : el.items_available})
  });  

  //If array empty get new items
  if(oldItems.length < 1) storeItems = newItems;

  if(oldItems.length > 1)
    for (let i = 0; i < storeItems.length; i++)
      if(oldItems[i].quantity != newItems[i].quantity && newItems[i].quantity == 1)
        sendMail("TGTG Notifier", `Nouveau panier -> ${newItems[i].name}`)
  
  console.log(`TGTG Notifier cron`);

}

const sendMail = async(object, message) => {
  let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dev.jrmy@gmail.com',
        pass: ""
    }
  });
 
  let mailDetails = {
    from: 'dev.jrmy@gmail.com',
    to: 'jeremy.piorun@gmail.com',
    subject: object,
    text: message
  };
 
  mailTransporter.sendMail(mailDetails, function(err, data) {
    if(err) {
        console.log('Error Occurs');
    } else {
        console.log('Email sent successfully');
    }
  });
}


cron.schedule("*/30 * * * * *", function() {
  tgtg();
});

// App
const app = express();
app.get('/', (req, res) => {
  res.send("TGTG Notifier page" );
});

app.listen(PORT, HOST);
console.log(`TGTG Notifier is running`);
sendMail("TGTG Notifier", "Project is running");
