# Smapp - Server side

## Before start the server
Create .env file to the root directory.<br>
Set following values:

- **CLIENT_URL**<br>
If you didn't change frontend config, it's http://localhost:3000
- **ACCESS_TOKEN_SECRET_KEY**<br>
Random secret key
- **REFRESH_TOKEN_SECRET_KEY**<br>
Random secret key
- **TOKEN_DURATION**<br>
(number)s - exmaple: 60s
## To run server
Run the development server:

`npm install && npm start && npm run migrate`

## Add mock data
To add mock data into database:

`npm run seed`

If you run this command, you can log into a test account.<br>
username: test<br>
password: test



