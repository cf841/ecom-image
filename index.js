const { upload, download } = require("./interaction.js");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const cors = require('cors');
const sharp = require('sharp');
const express = require('express');
const app = express();
const port = 3000;

const corsOptions = {
  origin : "*",
  methods: "GET,POST"
}
app.use(cors(corsOptions));
app.use(express.json());

app.post('/image', async (req, res) => {
  try {
    const imageId = req.body.image; // Assume request now contains a single image ID
    let imageData = cache.get(imageId);
    if (!imageData) {
      console.log(`Fetching image for ID: ${imageId}`);
      let buffer = await download(imageId); // Assuming this function exists and returns a buffer
      // Compress the image using sharp
      buffer = await sharp(buffer)
        .jpeg({ quality: 70 }) // Adjust the quality as needed
        .toBuffer();
      imageData = buffer;
      cache.set(imageId, imageData, 100000); // Cache for 120 seconds
    } else {
      console.log(`Serving cached image for ID: ${imageId}`);
    } 
    // Assuming imageData.data is a buffer of the image
    res.setHeader('Content-Type', 'image/jpeg'); // Set MIME type as JPEG
    res.send(imageData); // Send the image data as a blob
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});