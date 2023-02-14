const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// aws client for deploy

/* const client = new S3Client({ 
  region: 'us-east-1', 
  signatureVersion: 'v4' 
});  */

// local client with s3 local plugin
	
    const client = new S3Client({
      forcePathStyle: true,
      credentials: {
        accessKeyId: "S3RVER", // This specific key is required when working offline
        secretAccessKey: "S3RVER",
      },
      endpoint: "http://localhost:4569",
    });

 async function authenticate(doc) {
    try {
        const download_bucket_params = {
            Bucket: "local-bucket",
            Key: "token"
          };
        const content = await client.send(new GetObjectCommand(download_bucket_params)); 
        doc = content
        console.log("using token")
    } catch (error) {
        console.log("no token detected, creating new one")
        spreadsheetAuth(doc)
        const payload = JSON.stringify(doc)
        client
        .send(
          new PutObjectCommand({
            Bucket: "local-bucket",
            Key: "token",
            Body: Buffer.from(payload),
          })
        )
        console.log("new token created")
        return doc
    }

}
 

module.exports.write = async event => {

   try{
    if(!event.body) {
      return formatResponse(400, { message: 'body is missing' });
  } 
  const body = JSON.parse(event.body)
  
  const regExp1024 = /^(.{1,1024})$/;
  const regExp255 = /^(.{1,255})$/;
  const regExp25 = /^(.{1,25})$/;

  if(!body.row) {
    return formatResponse(400, { message: 'row object is missing' });

  } else if (Object.keys(body.row).length > 5) {
    return formatResponse(400, { message: 'too much fields' });

  } else if (!body.row.company || !regExp255.test(body.row.company) || !body.row.name || !regExp255.test(body.row.name) || !body.row.phone || !regExp25.test(body.row.phone) || !body.row.email || !regExp255.test(body.row.email) || !regExp1024.test(body.row.message)) {
    return formatResponse(400, { message: 'error in fields' });
  } 
  authenticate(doc).then(()=>{
    console.log("adding row with existing token")
    doc.loadInfo()
    .then(()=>{
      doc.sheetsByIndex[0].addRow(body.row);
    })
     .catch(()=>{
      console.log("token expired, starting delete")
        try{
            const delete_object_from_bucket_params = {
                Bucket: "local-bucket",
                Key: "token",
              }
              client.send(
                new DeleteObjectCommand(delete_object_from_bucket_params)
            ).then(console.log("token deleted, creating a new one"))
            .then(()=>{
                authenticate(doc).then(()=>{
                  doc.loadInfo()
                  .then(()=>{
                    doc.sheetsByIndex[0].addRow(body.row).then(console.log("New row added with new token"));
                  })
                })
              })
        } catch (error) {
            console.log
        }
  })
})
  return formatResponse(200, { message: 'New row added'});
  } catch (error){
    console.log(error)
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