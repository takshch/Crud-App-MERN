const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const path = require('path');
const autoIncrement = require("mongodb-autoincrement");
const ObjectId = require("mongodb").ObjectID;

const CONNECTION_URL = `mongodb://fidisys-api:!%403asflkj4%23sfslkms%23@ds129023.mlab.com:29023/heroku_s9zfc9ft`;
const COLLECTION_NAME = "items";

var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var database, collection;

const { response, request } = require("express");

app.listen(process.env.PORT || 5000, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db("");
        collection = database.collection(COLLECTION_NAME);
        console.log("Connected!");
    });
});


if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(Express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}


app.get("/api/", (request, response) => {
    response.send(`API ENDPOINTS:<br />
        - - - -  "/items" -- to fetch all items<br />
        - - - -  "/add" -- to add new item<br />
        - - - -  "/update" -- to edit price of item with id<br />
        - - - -  "/delete" -- to delete item<br />
    `);
});


app.get("/api/items", (request, response) => {
    collection.find({},{projection:{_id:0}}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});


app.post("/api/add",(request,response)=>{
    if(("name" in request.body) && ("price" in request.body) && !isNaN(request.body.price) && request.body.name !== "" && request.body.price !== "" 
    && typeof request.body.name === 'string' && typeof request.body.price !== 'string'){

        autoIncrement.getNextSequence(database, COLLECTION_NAME, function (err, autoIndex) {
            var collection_local = database.collection(COLLECTION_NAME);
            if(!err){
                collection_local.insertOne({id: autoIndex, ...request.body},(error,result)=>{
                    if(error){
                        return response.status(500).send(error);
                    } 
                    if(result.result.ok === 1){
                        response.send({status: "success", error: null});
                    }else{
                        response.send(result.result);
                    }
                });
            }else if(!("name" in req.body) || !("price" in req.body) || req.body.id === "" || req.body.price === ""){
                response.send({error: "fields are missing"});
            }
            else{
                response.send({error: "Something is not right!"});
            }
        });

    }else if(!("name" in request.body) || !("price" in request.body) || request.body.name === "" || request.body.price === ""){
        response.send({error: "fields are missing"});
    }else{
        response.send({error: "name and price must be string and number respectively."});
    } 
});

app.post("/api/update",(req,response)=>{
    if(("id" in req.body) && ("price" in req.body) && req.body.id !== "" && req.body.price !== "" && !isNaN(req.body.id)  && !isNaN(req.body.price) 
    && typeof req.body.id !== 'string' && typeof req.body.price !== 'string'){
        let id = parseInt(req.body.id);
        collection.findOne({id},(error,result)=>{
            console.log(result);
            if(error){
                response.send({error: "something wrong"});
            }
            if(result !== null && result.id === id){
                collection.updateOne({id},{$set:{price: req.body.price}},(error,result)=>{
                    if(error){
                        response.send({error: "Something is not right!"});
                    }
                    else if(result){
                        response.send({status: "success",error: null});
                    }
                });
            }else{
                response.send({error: "id doesn't exits"});
            }
        });
    }else if(!("id" in req.body) || !("price" in req.body) || req.body.id === "" || req.body.price === ""){
        response.send({error: "fields are missing"});
    }
    else{
        response.send({error: "id and price must be number"});
    }
});

app.post("/api/delete",(req, response)=>{

    if(("id" in req.body) && !isNaN(req.body.id) && req.body.id !== "" && typeof req.body.id !== 'string' ){
        let id = parseInt(req.body.id);
        collection.findOne({id},(error,result)=>{
            console.log(result);
            if(error){
                response.send({error: "something wrong"});
            }
            if(result !== null && result.id === id){
                collection.deleteOne({id},(error,result)=>{
                    if(error){
                        response.send({error: "Something is not right!"});
                    }else if(result.deletedCount === 1){
                        response.send({status: "deleted",error: null});
                    }
                });
            }else{
                response.send({error: "id doesn't exits"});
            }
        });
    }else if(!("id" in req.body) || req.body.id === ""){
        response.send({error: "fields are missing"});
    }else{
        response.send({error: "id must be number"});
    }
});