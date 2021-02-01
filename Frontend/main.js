const express = require("express");
const app = express();
const multer = require('multer');
const upload = multer({dest: 'D:\\Documents\\Coding\\PDFStoreNew\\Temp'});
const path = require("path");
const Queue = require('bee-queue');
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
})

const options = {
    removeOnSuccess: true,
    redis: {
        host: "127.0.0.1",
        port: 6379
    },
}

const image_handler = new Queue('convert_to_image', options);
const s3_upload = new Queue('upload_to_s3', options);
const text_processor = new Queue('process_text', options);

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file || !fs.existsSync(req.file.path)) {
    console.log("No file received");
    return res.send({
      success: false
    });
  } else {
    console.log('file received');
    let job = {
        s3_location: "/uploads/" + req.file.filename + "/source.pdf",
        disk_location: req.file.path,
        document_type: "application/pdf"
    }
    s3_upload.createJob(job).save();
    image_handler.createJob(req.file).save();
    text_processor.createJob(req.file).save();

    return res.send({
      success: true,
      response: req.file
    })
  }
});


app.listen(8080)
