const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express(); // create express app
const path = require("path");
const { createProxyMiddleware } = require('http-proxy-middleware');



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
app.listen(80, () => {
  console.log("server started on port 80");
});