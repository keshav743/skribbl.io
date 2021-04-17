var socket = io();
var canvas;
var context;
var users = [];
var drawer = false;
var word;

socket.on("draw or guess", (role) => {
  drawer = role;
});

socket.on("draw guess", (obj) => {
  draw(obj);
});

socket.on("random word", (word) => {
  word = word;
  console.log(word);
  if (word && drawer) {
    $("h5").text(word);
    $(".guess-div").hide();
  }
});

socket.on("guess result", (b) => {
  console.log(b);
});

socket.on("users", (users) => {
  users = users;
  if ($(".user-list").length == 0) {
    $("<div/>", {
      text: users,
      class: "user-list",
    }).appendTo(".gameScreen");
  } else {
    $(".user-list").text(users);
  }
  console.log(users);
});

socket.on("message", (message) => {
  console.log(message);
});

var submitGuessForm = () => {
  $(".guess-form").submit(function (e) {
    e.preventDefault();
    socket.emit("guess word", $("#guess").val().trim());
  });
};

var formSubmit = () => {
  $(".entryForm").submit(function (e) {
    e.preventDefault();
    socket.emit("join", $("#username").val().trim());

    $(".detailForm").hide();
    $(".gameScreen").show();
  });
};

var draw = function (obj) {
  context.fillStyle = obj.color;
  context.beginPath();
  context.arc(obj.position.x, obj.position.y, 3, 0, 2 * Math.PI);
  context.fill();
};

$(document).ready(function () {
  canvas = $("#canvas");
  context = canvas[0].getContext("2d");

  $(".detailForm").show();
  $(".gameScreen").hide();
  formSubmit();
  submitGuessForm();

  var obj = {};
  var drawing = false;

  canvas.on("mousedown", function (event) {
    drawing = true;
  });
  canvas.on("mouseup", function (event) {
    drawing = false;
  });

  canvas.on("mousemove", function (event) {
    var offset = canvas.offset();
    obj.position = {
      x: event.pageX - offset.left,
      y: event.pageY - offset.top,
    };

    if (drawing == true) {
      context.fillStyle = "red";
      obj.color = "red";
      if (drawer) {
        draw(obj);
        socket.emit("draw", obj);
      }
    }
  });
});
