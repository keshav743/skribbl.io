var socket = io();
var canvas;
var context;
var users = [];
var drawer = false;
var word;
var user = $("#username").val().trim();
var drawerName;
var colorDraw = "red";

socket.on("draw or guess", (role) => {
  drawer = role;
});

socket.on("name error", (msg) => {
  $(".gameScreen").hide();
  $(".detailForm").show();
  return alert(msg);
});

socket.on("turn to drawer", (obj) => {
  drawer = obj.drawBool;
  $("h5").show();
  $("h5").text("Hint Word: " + obj.word);
  $(".guess-div").hide();
});

socket.on("draw guess", (obj) => {
  draw(obj);
});

socket.on("clear screen", (msg) => {
  context.clearRect(0, 0, 2000, 2000);
});

socket.on("who is the drawer", (obj) => {
  console.log(obj.drawBool);
  drawer = obj.drawBool;
  console.log(obj);
  if (obj.word && obj.drawBool) {
    $("h5").show();
    $("h5").text("Hint Word: " + obj.word);
    $(".guess-div").hide();
  }
});

socket.on("guess board", (guesses) => {
  var content =
    "<h4 style='text-align: left;'>Guesses Made:</h4><div class='spacer'></div>";
  guesses.forEach((e) => {
    content =
      content + `<li class="list-group-item">${e.name} - ${e.word}</li>`;
  });
  $(".guess-board").html(content);
});

socket.on("leader board", (board) => {
  console.log(board);
  var content = "<h4>LeaderBoard:</h4><div class='spacer'></div>";
  board.forEach((e) => {
    content =
      content + `<li class="list-group-item">${e.name} - ${e.points}</li>`;
  });
  $(".leader-div").html(content);
});

socket.on("turn to guesser", (msg) => {
  $("h5").hide();
  $(".guess-div").show();
  drawer = false;
});

socket.on("random word", (word) => {
  word = word;
  console.log(word);
  if (word && drawer) {
    $("h5").text("Hint Word: " + word);
    $(".guess-div").hide();
  }
});

socket.on("guess result", (b) => {
  if (b.correct) {
    // alert(msg);
    $(".result-tab").show();
    $(".result-tab-header").text(b.msg);
    setTimeout(() => {
      $(".result-tab-header").hide();
      $(".result-tab").hide();
    }, 1000);
  }
  console.log(b.msg);
  $("#guess").val("");
});

socket.on("users", (users) => {
  users = users;
  // if ($(".user-list").length == 0) {
  //   $("<div/>", {
  //     text: users,
  //     class: "user-list",
  //   }).appendTo(".gameScreen");
  // } else {
  //   $(".user-list").text(users);
  // }
  var content = "";
  users.forEach((e) => {
    content = content + `<li class="list-group-item">${e}</li>`;
  });
  console.log(content);
  $(".user-list").html(content);
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
    if ($("#username").val().trim() == "") {
      alert("Please provide a name");
      return;
    }
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
  $(".result-tab").hide();
  $(".red").click(function (e) {
    e.preventDefault();
    colorDraw = "red";
  });
  $(".green").click(function (e) {
    e.preventDefault();
    colorDraw = "green";
  });
  $(".blue").click(function (e) {
    e.preventDefault();
    colorDraw = "blue";
  });
  $(".black").click(function (e) {
    e.preventDefault();
    colorDraw = "black";
  });
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
      context.fillStyle = colorDraw;
      obj.color = colorDraw;
      if (drawer) {
        draw(obj);
        socket.emit("draw", obj);
      }
    }
  });
});
