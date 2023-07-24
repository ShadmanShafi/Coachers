## A web app for high school students.
## Features
- Watching Videos
- Creating schedules
- Tracking progress
- Admin Panel to configure users and subjects

## To run
- Install Node onto your device including npm.

- Clone the repository onto your device.

- Install the dependencies with 
```
npm install
```
- Then run the web app using 
```
npm start
```
The app should be start running. The `.env` file provided should contain the MongoDB configuration for some demo data. For your own application, please enter your own database configuration. 

The application also comes with its own admin panel. To access it go to the route `.../admin`. For example, if the app is running at `http://localhost:4233/`, go to `http://localhost:4233/admin`. There you can sign in simply with the following credentials.

Email: `admin@admin.com`<br />
Password: `9cd4c26428`<br />

Inside the admin panel, you can add and customize existing subjects and their topics/chapters.

On the regular site, i.e., `http://localhost:4233/users/login`, you can sign in using the following credentials.

Email: `dummy@dummy.com`<br />
Password: `9cd4c26428`<br />

Please go through to check out all of the features.
 


