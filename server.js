const express = require('express');
const bodyparser = require('body-parser');
const uuid = require("uuid").v4
const app = express();
const cors = require("cors")
const mongoose = require("mongoose");
const ImageStack =  require("./src/models/image-stack");

const base64 = require('./src/utils/base64-img')

mongoose.connect("mongodb://localhost/p3a5", { useNewUrlParser: true});


app.use(cors())
app.use(bodyparser.json({ defaultCharset: "utf8", extended: true, limit: "1024mb", type: 'application/json'}))
app.use("/images", express.static("./images"));


app.get('/', function (req, res) {
    res.send({hello: "SUCK MY COCK"})
});


/**
 * Received data = { 
 *  images: string[] -- list of base64 data of images uploaded by user 
 * }
 * Returned data = {
 *  token: string,
 *  success: boolean
 * }
 */

app.post('/process-images', async (req, res) => {
    console.log("HELLO")
    const stackId = uuid();
    console.log("STAKCID " + stackId)
    if(!req.body.images || !Array.isArray(req.body.images) || req.body.images.length == 0){
        res.send({ success: false, message: "Wrong images format or no images uploaded" })
        return
    }
    const testProcessed = []
    for (let imageData of req.body.images) {
        let parsedData;
        try{
            parsedData = base64.parseBase64(imageData);
        }catch(err){
            continue;
        }
            console.log("DATA FORMAT " + parsedData.format)
        const savePath = base64.saveBase64(parsedData.content, parsedData.format)
        testProcessed.push(savePath)
    }
    const stack = new ImageStack({
      id: stackId,
      unprocessed: [],
      processed: testProcessed.map(v => {
        return { path: v, lines: [], blocks: [] };
      }),
      finished: false
    });
    try{
        const savedStack = await stack.save()
        
        res.send({ success: true, token: savedStack._id})
    }catch(err){
        res.send({ success: false, message: err} )
        return;
    }

})

/** Returned data
 * {
 *   images: string[], -- links to images stored on server
 * }
 */
app.get('/processed-data/:id', async (req, res) => {
    try{

        const imageStack = await ImageStack.findById(req.params.id)
        console.log(imageStack)
        if(imageStack)
        res.send({ 
            processedImages: imageStack.processed, 
            finished: imageStack.finished,  
            success: true
        })
        else
        res.send({success: false})
    }catch(err){
        res.send({success: false, message: err})
    }

})

app.listen(3000);