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
var leaderBoard = [];

var getRandomWord = () => {
  var randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};

io.on("connection", (socket) => {
  socket.emit("message", "Welcome to Skribble.io");
  socket.broadcast.emit("message", "A User Joined");
  io.emit("users", users);

  socket.on("join", (name) => {
    if (users.findIndex((e) => e == name) > -1) {
      return socket.emit(
        "name error",
        "Please choose another name. This name is aldready taken...."
      );
    }
    socket.name = name;
    socket.join(name);
    console.log(socket.name + " has joined. ID: " + socket.id);
    leaderBoard.push({ name: name, points: 0 });
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
      guesses = [];
      leaderBoard.forEach((element) => {
        if (element.name === socket.name) {
          element.points = element.points + 1;
        }
      });
      io.emit("guess board", guesses);
      console.log(users);
      console.log(drawer, count, socket.name, users[count]);
      if (count == users.length - 1) {
        count = 0;
      } else {
        count = count + 1;
      }
      io.emit("guess result", {
        correct: true,
        msg: `${socket.name} guessed it correctly.`,
      });
      pickedWord = getRandomWord();
      io.emit("clear screen", true);
      io.sockets.in(drawer).emit("turn to guesser", "Hello");
      drawer = users[count];
      socket.emit("who is the drawer", {
        drawBool: drawer == socket.name,
        word: pickedWord,
      });
      io.sockets
        .in(drawer)
        .emit("turn to drawer", { drawBool: true, word: pickedWord });
      console.log(drawer, count, socket.name, users[count]);
    } else {
      io.emit("guess result", {
        correct: false,
        msg: `${socket.name}'s guess: ${word}.`,
      });
      guesses.push({ name: socket.name, word: word });
      io.emit("guess board", guesses);
    }
    console.log(leaderBoard);
    io.emit("leader board", leaderBoard);
  });

  socket.on("disconnect", () => {
    io.emit("message", "A User Left");
    users = users.filter((el) => el != socket.name);
    console.log(leaderBoard, socket.name);
    leaderBoard = leaderBoard.filter((e) => {
      e.name != socket.name;
    });
    console.log(leaderBoard);
    if (socket.name == drawer) {
      console.log("Drawer Exit");
    }
    io.emit("leader board", leaderBoard);
    io.emit("users", users);
  });

  socket.on("draw", (obj) => {
    socket.broadcast.emit("draw guess", obj);
  });
});

server.listen(3000, () => {
  console.log("Server up and running on Port 3000.");
});
