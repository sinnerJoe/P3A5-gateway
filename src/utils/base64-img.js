const fs = require("fs")
const paths = require("path")
const uuid = require("uuid").v4
const typeSearchRegex = /^data:image\/(\w+);base64,/;

function parseClientBase64(data){
    
    if(!typeSearchRegex.test(data))
        throw "INVALID BASE64 " + data
    const searchResult = typeSearchRegex.exec(data)

    const format = searchResult[1]
    const reg = new RegExp(`^data:image/${format};base64,`)
    const content = data.replace(reg, "");

    return {
        format: format,
        content: content
    }
}

function saveBase64(base64data, extension){

    const savePath = paths.join("images", uuid() + "." + extension)
    console.log("SAVE PATH: " + savePath)
    fs.writeFileSync(savePath, base64data, 'base64' )

    return savePath
}

function saveBase64ToFile(base64data, path){
    return new Promise((resolve, reject) => {
        fs.writeFile(path, base64data, "base64", (err)=> {
            if(err)
                reject(err)
            else 
                resolve();
        });
    })
}

module.exports = {
    parseBase64: parseClientBase64,
    saveBase64: saveBase64,
    saveBase64ToFile: saveBase64ToFile
}