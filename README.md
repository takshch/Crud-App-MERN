Setup:
Open CMD or terminal
1. Make a folder with AnyName and go to that folder by CD command.
2. git clone https://github.com/takshch/fidisysAssiAPI.git
3. cd fidisysAssiAPI
4. npm install
5. change CONNECTION_URL,COLLECTION_NAME with your mongodb url, and collection name respectively.File: (app.js)
6. Use "npm run start" to run and url will be localhost:3000
-------------------------------------------------------------------------
API ENDPOINTS:

1. "/items" -- to fetch all items
2. "/add" -- to add new item
3. "/update" -- to edit price of item with id
4. "/delete" -- to delete item
