'use strict';
const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

module.exports.write = async event => {
  if(!event.body) {
    return formatResponse(400, { message: 'body is missing' });
  }
  const body = JSON.parse(event.body);

  await spreadsheetAuth(doc);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];


  const row = await sheet.addRow(body.row);
  await row.save()

  return formatResponse(200, { message: 'New row added'});
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