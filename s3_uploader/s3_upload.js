const AWS = require('aws-sdk');
const Queue = require('bee-queue');
const fs = require('fs'); // Needed for example below

const endpoint = new AWS.Endpoint('ams3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: endpoint,
    accessKeyId: "",
    secretAccessKey: ""
});

const options = {
    removeOnSuccess: true,
    redis: {
        host: "127.0.0.1",
        port: 6379
    },
}

const s3_upload = new Queue('upload_to_s3', options);

s3_upload.process(function(job, done) {
    var params = {
        Bucket: "knowledge-hub",
        Key: job.data.s3_location,
        Body: fs.createReadStream(job.data.disk_location),
        ContentType: job.data.document_type,
        ACL: "private"
    };

    s3.putObject(params, function(err, data) {
        console.log(data);
        console.log(err)
        if (err) done(err);
        else     done(null, data);
    });
});


s3_upload.on('succeeded', (job, result) => {
    console.log(result);
});
