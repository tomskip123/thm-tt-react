const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express(); // create express app
const path = require("path");
const { createProxyMiddleware } = require('http-proxy-middleware');


const PORT = process.env.PORT || 5000;


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use(express.static("build"));

console.log(process.env.API_URL)

app.use(
  '/api',
  createProxyMiddleware({
    target: `${process.env.API_URL}`,
    pathRewrite: {
      '^/api': '',
    },
    changeOrigin: true,
  })
);

// start express server on port 5000
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});