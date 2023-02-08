const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { existsSync } = require('fs');
const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
const TOKEN_PATH = path.join(process.cwd(), 'token.json');



 async function authenticate(doc) {
  if(existsSync(TOKEN_PATH)) { 
    const content = await fs.readFile(TOKEN_PATH);
    JSON.parse(content)
    doc = content
    console.log("using token")
  } else {
    spreadsheetAuth(doc)
    const payload = JSON.stringify(doc)
    await fs.writeFile(TOKEN_PATH, payload);
    console.log("new token created")
    return doc
  }
}
 

module.exports.write = async event => {
  try{
    if(!event.body) {
      return formatResponse(400, { message: 'body is missing' });
  } 

  const body = JSON.parse(event.body);
  
  authenticate(doc).then(()=>{
    doc.loadInfo()
    .then(()=>{
      doc.sheetsByIndex[0].addRow(body.row);
    })
     .catch(()=>{
      console.log("token expired, creating new one")
      fs.unlink(TOKEN_PATH).then(()=>{
        authenticate(doc).then(()=>{
          doc.loadInfo()
          .then(()=>{
            doc.sheetsByIndex[0].addRow(body.row);
          })
        })
      })
    }) 
  })
  
  return formatResponse(200, { message: 'New row added'});
  } catch (error){
    return formatResponse(400, { message: 'error'});
  }
};

function spreadsheetAuth(document) {
  return document.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  });
}

function formatResponse(statusCode, payload) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(
      payload,
      null,
      2
    ),
  };
}