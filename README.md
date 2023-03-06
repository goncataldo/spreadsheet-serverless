1. make a google cloud proyect
2. go to https://console.cloud.google.com/apis/credentials and select "+ CREATE CREDENTIALS" > "Service account"
3. once the service acount is created, go to "KEYS" and create a new key, a json file should be downloaded.
4. save the information in "client_email" and "private_key" for the .env.yml
5. create a google spreadsheet and make it editable for the "client_email" saved from the json file and save the ID from the url.
6. create an .env.yml like the example and complete it with the information saved from the json and the spreadsheet ID
7. make sure to write the row headers (name, email, company, phone) on the spreadsheet
8. "npm i" on terminal
9. go to https://console.developers.google.com/apis/api/sheets.googleapis.com/overview and accept spreadsheets permission 
10. "sls offline" on terminal
11. to verify that everything is working, insert this on terminal (dont forget to complete with the post endpoint):
```
curl --location --request POST 'http://localhost:3000/dev/write' \
--header 'Content-Type: application/json' \
--data-raw '{
    "row": {"company":"valtech", "phone":"1122993355", "name":"nombresito apellido", "email":"email@email.com"}
}'
```
