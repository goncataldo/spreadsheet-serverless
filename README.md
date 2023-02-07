1. make a google cloud proyect
2. go to https://console.cloud.google.com/apis/credentials and select "+ CREATE CREDENTIALS" > "Service account"
3. once the service acount is created, go to "KEYS" and create a new key, a json file should be downloaded.
4. save the information in "client_email" and "private_key" for the .env.yml
6. create a google spreadsheet and save the ID from the url.
5. create an .env.yml like the example and complete it with the information saved from the json and the spreadsheet ID
7. make sure to write the row headers on the spreadsheet, example: <br>
![example](https://gcdnb.pbrd.co/images/QWm9nzoQ9lk8.png?o=1)
6. "npm i" on terminal
7. "sls offline" on terminal
8. to verify that everything is working, insert this on terminal (dont forget to complete with the post endpoint):
```
curl --location --request POST 'https://<INSERT-POST-ENDPOINT-HERE>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "row": {"name":"gonzalo", "email":"gonzalo@email.com"}
}'
```
