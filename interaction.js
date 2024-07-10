const { PutObjectCommand, S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const fs = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");
dotenv.config();

const pipe = promisify(pipeline);

const bucket = process.env.BUCKET_NAME;
const region = process.env.REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: region
});

async function upload(id) {
    try {
        const fileContent = fs.readFileSync(id);
        const params = {
            Bucket: bucket,
            Key: "flat-white(1).jpg",
            Body: fileContent
        }
        const command = new PutObjectCommand(params);
        await s3.send(command);
    } catch (e) {
        console.error(e);
    }
}

async function download(id) {
    const getParams = {
        Bucket: bucket,
        Key: id
    };
    try {
        const response = await s3.send(new GetObjectCommand(getParams));
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        return buffer;
    } catch (e) {
        console.error(e);
        return null;
    }
}

module.exports = { upload, download };