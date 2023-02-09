/// Fundamental Objects

const gameWindow = {
  getMiddleX() {
    return gameWindow.X / 2;
  },
  getMiddleY() {
    return gameWindow.Y / 2;
  },
};

const colors = {
  background: "#0D1117",
  gameObjects: {
    ball: "#382694",
    paddle: "#FFF",
    bricks: "#999",
  },
  text: {
    score: "#000",
    lose: "#F00",
  },
};

const gameStateText = {
  textSize: 120,
};

const scoreText = {
  textSize: 36,
};

const keyCodesObject = {
  A: 65,
  D: 69,
};

// **************************************************** //

/// Basic Variables

const BugFixVal = 1; // pixels

let playerScore = 0;
let gameState = "playing";

// **************************************************** //

/// Fundamental Classes
class Ball {
  constructor(paddle) {
    this.D = 30;
    this.velocity = createVector(gameWindow.X / 150, -gameWindow.Y / 150);
    this.location = createVector(
      paddle.location.x + paddle.width / 2,
      paddle.location.y - this.D / 2
    );
    this.paddle = paddle;
  }

  bouncePaddle() {
    const xCheckMax = this.location.x + this.D / 2 >= this.paddle.location.x;
    const xCheckMin =
      this.location.x - this.D / 2 <=
      this.paddle.location.x + this.paddle.width;

    if (xCheckMax && xCheckMin) {
      if (this.location.y + this.D / 2 > this.paddle.location.y) {
        this.rev("y");
        this.location.y = this.paddle.location.y - this.D / 2 - BugFixVal;
      }
    }
  }

  bounceEdge() {
    if (this.location.x + this.D / 2 >= gameWindow.X) this.rev("x");
    if (this.location.x - this.D / 2 <= 0) this.rev("x");
    if (this.location.y - this.D / 2 <= 0) this.rev("y");
  }

  display() {
    fill(colors.gameObjects.ball);
    circle(this.location.x, this.location.y, this.D);
  }

  update() {
    this.location.add(this.velocity);
  }

  rev(coord) {
    this.velocity[coord] *= -1;
  }

  belowBottom() {
    return this.location.y - this.D / 2 > gameWindow.Y;
  }
}

class Paddle {
  constructor() {
    this.width = 150;
    this.height = 25;
    this.YOffset = 35;
    this.location = createVector(
      gameWindow.getMiddleX() - this.width / 2,
      gameWindow.Y - this.YOffset
    );

    this.speed = {
      right: createVector(gameWindow.X / 100, 0),
      left: createVector(-gameWindow.X / 100, 0),
    };
  }

  display() {
    fill(colors.gameObjects.paddle);
    rect(this.location.x, this.location.y, this.width, this.height);
  }

  move() {
    if (this.location.x < 0) this.location.x = 0;
    if (this.location.x + this.width > gameWindow.X)
      this.location.x = gameWindow.X - this.width;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(keyCodesObject.A))
      this.location.add(this.speed.left);
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(keyCodesObject.D))
      this.location.add(this.speed.right);
  }
}

class Brick {
  constructor(location, width, height) {
    this.location = location;
    this.width = width;
    this.height = height;
    this.points = 1;
  }

  display() {
    fill(colors.gameObjects.bricks);
    rect(this.location.x, this.location.y, this.width, this.height);
  }

  isBallColliding(ball) {
    const xCheckMax = ball.location.x + ball.D / 2 >= this.location.x;
    const xCheckMin =
      ball.location.x - ball.D / 2 <= this.location.x + this.width;

    const yCheckMax = ball.location.y + ball.D / 2 >= this.location.y;
    const yCheckMin =
      ball.location.y - ball.D / 2 <= this.location.y + this.height;

    if (xCheckMax && xCheckMin && yCheckMax && yCheckMin) return true;
  }
}

// **************************************************** //

/// Game Objects
let paddle;
let ball;

// **************************************************** //

/// Setup and Draw Functions

function setup() {
  gameWindow.X = displayWidth;
  gameWindow.Y = displayHeight;

  paddle = new Paddle();
  ball = new Ball(paddle);

  bricks = createBricks(colors.gameObjects.bricks);

  scoreText.X = gameWindow.X - scoreText.textSize * 6;
  scoreText.Y = 50;
  gameStateText.X = gameWindow.getMiddleX() - gameStateText.textSize * 2;
  gameStateText.Y = gameWindow.getMiddleY();

  createCanvas(gameWindow.X, gameWindow.Y);
}

function draw() {
  background(colors.background);
  paddle.display();
  manageBricks();

  displayScore();

  if (gameState === "playing") playingState();
  else endGame();
}

// **************************************************** //

/// Fundamental Functions
function playingState() {
  ball.bounceEdge();
  ball.bouncePaddle();
  ball.update();
  ball.display();

  paddle.move();

  if (ball.belowBottom()) gameState = "lose";
  if (bricks.length === 0) gameState = "win";
}

function endGame() {
  textSize(gameStateText.textSize);
  fill(gameState === "lose" ? colors.text.lose : randomColor());
  const additionalMessage = gameState === "lose" ? "Game Over" : "Good Job";

  text(
    `You ${gameState}!\n${additionalMessage}`,
    gameStateText.X,
    gameStateText.Y
  );
}

function displayScore() {
  textSize(scoreText.textSize);
  fill(colors.text.score);
  text(`Score: ${playerScore}`, scoreText.X, scoreText.Y);
}

let bricks = [];

function createBricks() {
  const rows = 10;
  const bricksPerRow = 15;
  const brickSize = {
    width: gameWindow.X / bricksPerRow,
    height: 25,
  };

  let brick;
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i < bricksPerRow; i++) {
      brick = new Brick(
        createVector(brickSize.width * i, brickSize.height * row),
        brickSize.width,
        brickSize.height
      );
      bricks.push(brick);
    }
  }
  return bricks;
}

function manageBricks() {
  for (let i = bricks.length - 1; i >= 0; i--) {
    const brick = bricks[i];

    if (brick.isBallColliding(ball)) {
      ball.rev("y");
      bricks.splice(i, 1);
      playerScore += brick.points;
    } else brick.display();
  }
}

function createCastlePillars() {}

function mousePressed() {
  if (
    mouseX > 0 &&
    mouseX < gameWindow.X &&
    mouseY > 0 &&
    mouseY < gameWindow.Y
  ) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

/// Helper functions
function randomColor() {
  return "#" + Math.trunc(Math.random() * 0xfff).toString(16);
}
