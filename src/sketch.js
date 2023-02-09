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
  background: "#252526",
  gameObjects: {
    ball: "#382694",
    paddle: "#FFF",
    bricks: "#999",
    pillars: "#0D1117",
  },
  text: {
    score: "#FFF",
    lose: "#F00",
  },
};

const pillars = {
  width: 250,
  height: 300,
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
  constructor(paddle, ...pillars) {
    this.D = 30;
    this.rad = 15;
    this.velocity = createVector(gameWindow.X / 150, -gameWindow.Y / 150);
    this.location = createVector(
      paddle.location.x + paddle.width / 2,
      paddle.location.y - this.rad
    );
    this.paddle = paddle;
    this.pillars = pillars;
  }

  bouncePaddle() {
    const xCheckMax =
      this.location.x - this.rad <=
      this.paddle.location.x + this.paddle.width / 2;
    const xCheckMin =
      this.location.x + this.rad >=
      this.paddle.location.x - this.paddle.width / 2;

    if (xCheckMax && xCheckMin) {
      if (
        this.location.y + this.rad >=
        this.paddle.location.y - this.paddle.height / 2
      ) {
        this.rev("y");
        this.location.y =
          this.paddle.location.y -
          this.paddle.height / 2 -
          this.rad -
          BugFixVal;
      }
    }
  }

  bouncePillar() {
    for (let pillar of this.pillars) {
      line(
        pillar.location.x - pillar.width / 2,
        pillar.location.y,
        pillar.location.x - pillar.width / 2,
        gameWindow.Y
      );
      line(
        pillar.location.x + pillar.width / 2,
        pillar.location.y,
        pillar.location.x + pillar.width / 2,
        gameWindow.Y
      );

      // FIXME: there are some colliding issues with both of these ifs, need to find a way to have one or the other trigger, not both at some times

      if (this.location.y + this.rad < pillar.height) {
        if (
          (this.location.x - this.rad > 0 &&
            this.location.x + this.rad < pillar.width) ||
          (this.location.x - this.rad >
            gameWindow.getMiddleX() - pillar.width / 2 &&
            this.location.x + this.rad <
              gameWindow.getMiddleX() + pillar.width / 2) ||
          (this.location.x - this.rad > gameWindow.X - pillar.width &&
            this.location.x + this.rad < gameWindow.X)
        )
          this.rev("x");
      }

      if (
        this.location.x + this.rad >= pillar.location.x - pillar.width / 2 &&
        this.location.x - this.rad <= pillar.location.x + pillar.width / 2 &&
        this.location.y - this.rad <= pillar.location.y + pillar.height / 2
      ) {
        this.rev("y");
        fill("red");
        rect(gameWindow.getMiddleX(), gameWindow.getMiddleY(), 50);
      }
    }
  }

  bounceEdge() {
    if (this.location.x + this.rad >= gameWindow.X) this.rev("x");
    if (this.location.x - this.rad <= 0) this.rev("x");
    if (this.location.y - this.rad <= 0) this.rev("y");
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
    return this.location.y - this.rad > gameWindow.Y;
  }
}

class Paddle {
  constructor() {
    this.width = 150;
    this.height = 25;
    this.YOffset = 35;
    this.location = createVector(
      gameWindow.getMiddleX(),
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
    if (this.location.x - this.width / 2 < 0) this.location.x = this.width / 2;
    if (this.location.x + this.width / 2 > gameWindow.X)
      this.location.x = gameWindow.X - this.width / 2;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(keyCodesObject.A))
      this.location.add(this.speed.left);
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(keyCodesObject.D))
      this.location.add(this.speed.right);
  }
}

class Pillar {
  constructor(location, width, height) {
    this.location = location;
    this.width = width;
    this.height = height;
  }

  display() {
    fill(colors.gameObjects.pillars);
    rect(this.location.x, this.location.y, this.width, this.height);
    // line(this.location.x - this.width / 2, this.location.y, this.location.x - this.width / 2, gameWindow.Y);
    // line(this.location.x + this.width / 2, this.location.y, this.location.x + this.width / 2, gameWindow.Y);
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
    const xCheckMax =
      ball.location.x + ball.D / 2 >= this.location.x - this.width / 2;
    const xCheckMin =
      ball.location.x - ball.D / 2 <= this.location.x + this.width / 2;

    const yCheckMax =
      ball.location.y + ball.D / 2 >= this.location.y - this.height / 2;
    const yCheckMin =
      ball.location.y - ball.D / 2 <= this.location.y + this.height / 2;

    if (xCheckMax && xCheckMin && yCheckMax && yCheckMin) return true;
  }
}

// **************************************************** //

/// Game Objects
let paddle;
let ball;
let pillar_1;
let pillar_2;
let pillar_3;

// **************************************************** //

/// Setup and Draw Functions

function setup() {
  gameWindow.X = displayWidth;
  gameWindow.Y = displayHeight;

  pillar_1 = new Pillar(
    createVector(pillars.width / 2, pillars.height / 2),
    pillars.width,
    pillars.height
  );
  pillar_2 = new Pillar(
    createVector(gameWindow.getMiddleX(), pillars.height / 2),
    pillars.width,
    pillars.height
  );
  pillar_3 = new Pillar(
    createVector(gameWindow.X - pillars.width / 2, pillars.height / 2),
    pillars.width,
    pillars.height
  );

  paddle = new Paddle();
  ball = new Ball(paddle, pillar_1, pillar_2, pillar_3);

  const bricksArr = [
    createBricks(pillars.width),
    createBricks(gameWindow.getMiddleX() + pillars.width / 2),
  ];
  bricksArr.shift();
  bricks = bricksArr.flat();
  scoreText.X = gameWindow.X - scoreText.textSize * 6;
  scoreText.Y = 50;
  gameStateText.X = gameWindow.getMiddleX() - gameStateText.textSize * 2;
  gameStateText.Y = gameWindow.getMiddleY();

  createCanvas(gameWindow.X, gameWindow.Y);
  rectMode(CENTER);
}

function draw() {
  background(colors.background);
  allTimeState();

  if (gameState === "playing") playingState();
  else endGame();
}

// **************************************************** //

/// Fundamental Functions
function allTimeState() {
  paddle.display();
  manageBricks();

  pillar_1.display();
  pillar_2.display();
  pillar_3.display();

  displayScore();
}

function playingState() {
  ball.bounceEdge();
  ball.bouncePillar();
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

function createBricks(xOffSet) {
  const rows = 5;
  const bricksPerRow = 5;
  const brickSize = {
    width: (gameWindow.getMiddleX() - pillars.width * 1.5) / bricksPerRow,
    height: 30,
  };

  let brick;
  const yOffSet = brickSize.height * 3;
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i < bricksPerRow; i++) {
      brick = new Brick(
        createVector(
          brickSize.width * i + xOffSet + brickSize.width / 2,
          brickSize.height * row + brickSize.height / 2 + yOffSet
        ),
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
