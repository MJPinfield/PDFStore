const Queue = require('bee-queue');
const PDFImage = require("pdf-image").PDFImage;

const options = {
    removeOnSuccess: true,
    redis: {
        host: "127.0.0.1",
        port: 6379
    },
}

const images = new Queue('convert_to_image', options);
const s3_upload = new Queue('upload_to_s3', options);

images.process(function(job, done) {
    console.log("Processing: " + job.data.originalname);
    var pdfi = new PDFImage(job.data.path, {
        convertOptions: {
            "-quality": "75",
            "-background": "white"
        }
    });
    pdfi.convertFile().then(function(image_paths) {
        done(null, image_paths);
    });

});

images.on('succeeded', (job, result) => {
    console.log("Finished Processing: " + job.data.originalname);
    result.forEach((item, i) => {
        let s3_name = item.split("/")
            s3_name = s3_name[s3_name.length-1];
            s3_name = s3_name.replace("-", "/");
        let job = {
            s3_location: s3_name,
            disk_location: item,
            document_type: "image/png"
        }
        s3_upload.createJob(job).save();
    });
});

// sudo apt-get install imagemagick ghostscript poppler-utils
