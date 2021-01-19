const express = require("express");
const app = express();
const multer = require('multer');
const upload = multer({dest: '/Users/mjpinfield/Downloads/multer'});
const path = require("path");
const Queue = require('bee-queue');

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

const processor = new Queue('convert_to_image', options);
const s3_upload = new Queue('upload_to_s3', options);

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.log("No file received");
    return res.send({
      success: false
    });

  } else {
    console.log('file received');
    processor.createJob(req.file).save();
    let job = {
        s3_location: req.file.filename + "/source.pdf",
        disk_location: req.file.path,
        document_type: "application/pdf"
    }
    s3_upload.createJob(job).save();
    return res.send({response: req.file})
  }
});


app.listen(8080)
