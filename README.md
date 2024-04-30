# Image Archive
A simple image archive service that host a webpage (http://localhost:8080 by default) that allows uploading images aka Entries.  
This project is written in TypeScript using Node with a SQlite3 database as the backend and React bundled using vite as the frontend.  

## Getting Started  
1. Download and extract the latest release
2. Create a `.env` file based on `.env.example`
3. If you are using Windows you can run `install.bat` to install the application as a Windows Service, if not use `node main.js` to run the server

## Building From Source
1. Clone the repository
2. Download dependencies by running `npm install`
3. Build the project using `npm run build` this save to the `build` directory
4. Follow steps 2-3 in the Getting Started section

### Data Properties
Entries have the following properties
 - Image (All images are converted to png and saved on the host filesystem)
 - Title
 - Description
 - Donor
 - Year Created
 - Colour
 - Size
 - Physical Location
 - Media Type
 - Accession Number
 - Date Added
 - Date Last Modified
 - Collection

Collections have the following properties
- Name
- Date Created
