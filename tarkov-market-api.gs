const ss = SpreadsheetApp.getActiveSpreadsheet();
const ssPrivateData = ss.getSheetByName('private data');
const ssPublicData = ss.getSheetByName('public data');

/*
*    !!!IMPORTANT!!!
* set your api key here
* you can get it here: https://tarkov-market.com/dev/api
*/
const API_KEY = '';

//First row - header
const HEADER_ROWS_COUNT = 2;

//limits
//https://developers.google.com/apps-script/guides/services/quotas
//URL Fetch calls	20,000 / day	
//Triggers total runtime	90 min / day

//help
//https://developers.google.com/apps-script/reference/url-fetch


function fillAllItemsData() {
  let data = fetchJSON('https://tarkov-market.com/api/v1/items/all');
  
  //get range from A2 to E...
  let range = ssPrivateData.getRange(`A${1 + HEADER_ROWS_COUNT}:E${1 + HEADER_ROWS_COUNT + data.length - 1}`);
  
  //fill data
  let sheetData = [];
  for (let i=0; i<data.length; i++) {
    sheetData[i] = [];
    //col A
    sheetData[i][0] = data[i].uid;
    //col B
    sheetData[i][1] = data[i].name;
    //col C
    sheetData[i][2] = data[i].price;
    //col D
    sheetData[i][3] = data[i].avg24hPrice;
    //col E
    sheetData[i][4] = data[i].avg7daysPrice;
  }
  
  //set data
  range.setValues(sheetData);
  
  //set last updated
  setLastUpdateDate();
}

function setLastUpdateDate() {
  let range = ssPrivateData.getRange(`B1:B1`);
  var lastUpdated = (new Date()).toISOString();
  range.setValues([[lastUpdated]]);
}

//get JSON from api endpoint
function fetchJSON(url) {
  try {
    var response = UrlFetchApp.fetch(url, { headers: { 'x-api-key': API_KEY }});
    var json = response.getContentText();
    var data = JSON.parse(json);
    return data;
  }
  catch(err) {
    status = err.message;
  }
  return status;
}

//menu item click handler
function configureRun() {
  //remove triggers
  configureStop();
  //add new trigger - run every hour
  ScriptApp.newTrigger('fillAllItemsData').timeBased().everyHours(1).create();
}

//menu item click handler
function configureStop() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

//google sheet open event handler
function onOpen() {
  var menu = [
    { name: "Fill all items list", functionName: "fillAllItemsData" },
    null,
    { name: "Schedule run task every hour", functionName: "configureRun"},
    { name: "Remove schedule", functionName: "configureStop"},
  ];
  
  SpreadsheetApp.getActiveSpreadsheet().addMenu("➪ Tarkov-Market", menu);
}
    
    
//helper method
function columnNumberToLetter(zeroColLetter, columnIx) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    chars = chars.concat(chars.map(function(char) {return 'A'+char;}));
    var zeroIx = chars.indexOf(zeroColLetter);
    return chars[zeroIx + columnIx];
}
