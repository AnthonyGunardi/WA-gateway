const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const cors = require("cors");
const https = require('https');
const fs = require('fs');
const bodyParser = require("body-parser");
const PORT = 5003;
const multer = require("multer");
const upload = multer();

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  var app = express();
  app.use(cors());
  app.use(upload.array());

  const options = {
    key: fs.readFileSync('../ssl/privateKey.pem'),
    cert: fs.readFileSync('../ssl/anthonygunardi_com_cert.pem'),
  };
  const server = https.createServer(
    options, 
    app);

  app.post("/api/send-message", (req, res) => {
    const { number, message } = req.body;

    client.getNumberId(number).then((contact) => {
      let formattedNumber = contact._serialized;

      client.sendMessage(formattedNumber, message).then((response) => {
        let messageId = response.id._serialized;

        res.send({
          success: true,
          message: "Message sent successfully",
          data: {
            messageId,
          },
        });
      });
    });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

client.initialize();
