const request = require('request')
const FormData = require('form-data')
const fs = require('fs')
const ImageStack = require('../models/image-stack')
const base64 = require('../utils/base64-img')
function parsePositionObject(obj){
    return {
            x1: obj.topLeftCorner.x,
            y1: obj.topLeftCorner.y,
            x2: obj.bottomRightCorner.x,
            y2: obj.bottomRightCorner.y
        }
}

function changeAnalyzedDataFormat(data){
    if (!data.columns)
        throw new Error("Error on data returned by backend")

    let result = {
        lines: [],
        blocks: [],
        paragraphs: [],
        words : [],
        footnote: null,
        sidenotes: []
    }
    // console.log(data)
    
    for(let block of data.columns){
        result.blocks.push(parsePositionObject(block))
        if(Array.isArray(block.lines))
        for(let line of block.lines){
            result.lines.push(parsePositionObject(line))
            for(let word of line.words)
                result.words.push(parsePositionObject(word));
        }
    }

    for(let sidenote of data.sidenotes){
        result.sidenotes.push(parsePositionObject(sidenote))
    }

    for(let paragraph of data.paragraphs){
        result.paragraphs.push(parsePositionObject(paragraph))
    }
    if(data.footnote){
        result.footnote = parsePositionObject(data.footnote)
    }
    return result;
}


function sendFile(path, id){
    // const binary =  Buffer.from(base64Data, "base64");
    const form = new FormData();
    const file = fs.createReadStream(path)
    console.log("OPENEND FILE " + file.readableLength)
    form.append('image', file)
    form.submit("http://localhost:8080/segmentation/solution", async (err, response) => {
        if(!response)
            throw new Exception("BACKEND doesn't run or is inaccessible")
        response.resume()
        var data = ""
        response.addListener('data', chunk => {
            data += chunk
        })
        response.addListener('end', async ()=>{
            let receivedObject = JSON.parse(data);
            fs.writeFileSync("data.json", data);
            console.log(receivedObject)
            try{

                let parsedData = changeAnalyzedDataFormat(receivedObject);
                parsedData.path = path
                console.log("PARSED DATA: ");
                console.log(parsedData)
                await base64.saveBase64ToFile(receivedObject.clientImage, path);
                
                ImageStack.findOneAndUpdate( { _id: id } , 
                    { $push: { processed: parsedData }, $inc: {finished: 1}  })
                    .then(res => { 
                        console.log("SUCCES IN SAVING MODEL")
                        console.log(res)
                    },
                    err => {
                        console.log("ERROR")
                        console.log(err)
                    })
            }catch(err){
                console.log("ERROR ON BACK-END");
                ImageStack.findOneAndUpdate( { _id: id},
                    {$inc: {total: -1}});
            }
        })
    })
}

module.exports = {
    sendFile : sendFile
}