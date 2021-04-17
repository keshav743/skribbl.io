const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(`${__dirname}/public`));

const words = ["dog", "cat", "elephant", "car", "bike"];
var users = [];
var drawer;
var count = 0;
var pickedWord;
var guesses = [];

var getRandomWord = () => {
  var randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};

io.on("connection", (socket) => {
  socket.emit("message", "Welcome to Skribble.io");
  socket.broadcast.emit("message", "A User Joined");
  io.emit("users", users);

  socket.on("join", (name) => {
    socket.name = name;
    socket.join(name);
    console.log(socket.name + " has joined. ID: " + socket.id);

    users.push(name);
    console.log(users);
    io.emit("users", users);
    if (users.length >= 1 && !drawer) {
      drawer = users[count];
    }
    socket.emit("draw or guess", socket.name == drawer ? true : false);
    if (drawer == socket.name) {
      pickedWord = getRandomWord();
      socket.emit("random word", pickedWord);
    }
  });

  socket.on("guess word", (word) => {
    if (pickedWord.toLowerCase() == word.toLowerCase()) {
      count = 1;
      io.emit("guess result", `${socket.name} guessed it correctly.`);
    }
  });

  socket.on("disconnect", () => {
    io.emit("message", "A User Left");
    users = users.filter((el) => el != socket.name);
    io.emit("users", users);
  });

  socket.on("draw", (obj) => {
    console.log(obj);
    socket.broadcast.emit("draw guess", obj);
  });
});

server.listen(3000, () => {
  console.log("Server up and running on Port 3000.");
});
