const Queue = require('bee-queue');
const request = require('request');
const fs = require('fs');

const options = {
    removeOnSuccess: true,
    redis: {
        host: "127.0.0.1",
        port: 6379
    }
}

const text_processor = new Queue('process_text', options);

text_processor.process(function(job, done) {
    console.log(job.data.path)
    let pdf_file = fs.createReadStream(job.data.path);
    
    let req = request.put({
        url: "http://localhost:9998/tika",
        headers: {
            "Content-Type": "application/pdf"
        },
        body: pdf_file
    })

    req.on('response', function(response) {
        console.log(response.statusCode)
    })

    req.on('data', function(body) {
        let response_text = body.toString();
        console.log(response_text);
        done(null, response_text)
    })

    req.on('error', function(err) {
        console.log(err)
    })
});