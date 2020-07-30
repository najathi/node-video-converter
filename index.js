const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// file upload
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

// ffmpeg
ffmpeg.setFfmpegPath("D:/ffmpeg/bin/ffmpeg.exe");
ffmpeg.setFfprobePath("D:/ffmpeg/bin");
ffmpeg.setFlvtoolPath("D:/flvtool");

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/convert", (req, res) => {
    let to = req.body.to;
    let file = req.files.file;
    let fileName = `output.${to}`;
    console.log(to);
    console.log(file);

    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    ffmpeg("tmp/" + file.name)
        .withOutputFormat(to)
        .on("end", function (stdout, stderr) {
            console.log("Finished");
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on("error", function (err) {
            console.log("an error happened: " + err.message);
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName);
});

app.listen(5000, () => {
    console.log("App is listening on Port 5000");
});
