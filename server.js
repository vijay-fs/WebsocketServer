const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

function getFormattedTimestamp() {
  const date = new Date();
  return date.toLocaleString('en-US', { hour12: false });
}

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust according to your client's URL
    methods: ["GET", "POST"],
  },
});
const upload = multer({ dest: "uploads/" });

app.use(cors());

io.on("connection", (socket) => {
   console.log(`${getFormattedTimestamp()} - A user connected`);


  socket.on("disconnect", () => {
       console.log(`${getFormattedTimestamp()} - User disconnected`);
  });
});


app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log(
    `${getFormattedTimestamp()} - Upload started for ${file.originalname}`
  );

  // Simulate file upload progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    io.emit("upload-progress", { progress });
    if (progress >= 100) {
      clearInterval(interval);
      io.emit("file-uploaded", {
        filename: file.originalname,
        status: "uploaded",
      });
        console.log(
          `${getFormattedTimestamp()} - Upload completed for ${
            file.originalname
          }`
        );
     res.send({
        message: "File uploaded successfully",
        filename: file.originalname,
      });
    }
  }, 100); // Emit progress every 100ms
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
