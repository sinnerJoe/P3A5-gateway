const request = require('request')
const FormData = require('form-data')
const fs = require('fs')
const ImageStack = require('../models/image-stack')
function parsePositionObject(obj){
    return {
            x1: obj.topLeftCorner.x,
            y1: obj.topLeftCorner.y,
            x2: obj.bottomRightCorner.x,
            y2: obj.bottomRightCorner.y
        }
}

function changeAnalyzedDataFormat(data){
    let result = {
        lines: [],
        blocks: []
    }
    for(let block of data.columns){
        result.blocks.push(parsePositionObject(block))
        for(let line of block.lines){
            result.lines.push(parsePositionObject(line))
        }
    }
    return result;
}


function sendFile(path, id, imageNumber){
    // const binary =  Buffer.from(base64Data, "base64");
    const form = new FormData();
    const file = fs.createReadStream(path)
    console.log("OPENEND FILE" + file.readableLength)
    form.append('image', file)
    form.submit("http://localhost:8080/segmentation/get-cols", (err, response) => {
        response.resume()
        var data = ""
        response.addListener('data', chunk => {
            data += chunk
        })
        response.addListener('end', ()=>{
            let receivedObject = JSON.parse(data);
            console.log(receivedObject)
            console.log("LINE")
            console.log(receivedObject.columns[0].lines)
            let parsedData = changeAnalyzedDataFormat(receivedObject);
            parsedData.path = path
            console.log("PARSED DATA: ");
            console.log(parsedData)
            ImageStack.findOneAndUpdate( { _id: id } , { $push: { processed: parsedData }  })
            .then(res => { 
                console.log("SUCCES IN SAVING MODEL")
                console.log(res)
         },
            err => {
                console.log("ERROR")
                console.log(err)
            })
        })
    })
}

module.exports = {
    sendFile : sendFile
}