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
    cannon: "#FF9",
    paddle: "#FFF",
    bricks: "#999",
    pillars: "#0D1117",
    projectile: "#F76707",
  },
  text: {
    score: "#FFF",
    lose: "#F00",
  },
};

let movementSpeed = {};

const pillars = {
  width: 250,
  height: 330,
};

const gameStateText = {
  textSize: 120,
};

const scoreText = {
  textSize: 36,
};

const keyCodesObject = {
  A: 65,
  D: 68,
  SPACE: 32,
};

// **************************************************** //

/// Basic Variables

const bugFixVal = 1; // pixels

let shot = false;
let playerScore = 0;
let gameState = "playing";

// **************************************************** //

/// Fundamental Classes
class Ball {
  constructor(paddle, ...pillars) {
    this.D = 40;
    this.rad = 20;
    this.pos = createVector(
      paddle.pos.x,
      paddle.pos.y - paddle.height / 2 - this.rad
    );
    this.velocity = createVector();
    this.acceleration = createVector();
    this.topSpeed = 15;

    this.speed = movementSpeed;

    this.paddle = paddle;
    this.pillars = pillars;

    this.trail = [];
  }

  // prettier-ignore
  collidePaddle() {
    if (
      this.pos.x - this.rad < this.paddle.pos.x + this.paddle.width / 2 &&
      this.pos.x + this.rad > this.paddle.pos.x - this.paddle.width / 2 &&
      this.pos.y + this.rad > this.paddle.pos.y - this.paddle.height / 2
    ) gameState = "lose";
  }

  bouncePillar() {
    const normalPillars = this.pillars.filter((x) => x.type === "normal");
    const protectionPillars = this.pillars.filter(
      (x) => x.type === "protection"
    );

    for (let pillar of protectionPillars) {
      if (
        this.pos.x + this.rad >
          pillar.pos.x - pillar.protectionPillarWidth / 2 &&
        this.pos.x - this.rad <
          pillar.pos.x + pillar.protectionPillarWidth / 2 &&
        this.pos.y - this.rad < pillar.pos.y + pillar.protectionPillarHeight / 2
      )
        this.rev("y");
    }

    for (let pillar of normalPillars) {
      if (
        this.pos.x + this.rad > pillar.pos.x - pillar.normalPillarWidth / 2 &&
        this.pos.x - this.rad < pillar.pos.x + pillar.normalPillarWidth / 2 &&
        this.pos.y + this.rad < pillar.normalPillarHeight
      )
        this.rev("x");

      if (
        this.pos.x + this.rad > pillar.pos.x - pillar.normalPillarWidth / 2 &&
        this.pos.x - this.rad < pillar.pos.x + pillar.normalPillarWidth / 2 &&
        this.pos.y - this.rad < pillar.normalPillarHeight &&
        this.pos.y > pillar.normalPillarHeight
      )
        this.rev("y");
    }
  }

  bounceEdge() {
    if (this.pos.y - this.rad < 0) this.rev("y");
  }

  display() {
    strokeWeight(2);
    fill(colors.gameObjects.ball);
    circle(this.pos.x, this.pos.y, this.D);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.topSpeed);
    this.pos.add(this.velocity);
    this.acceleration.mult(0);

    if (frameCount % 5 === 0)
      this.trail.push({
        x: this.pos.x,
        y: this.pos.y,
      });
  }

  updatePos() {
    if (!shot) {
      if (this.pos.x - this.paddle.width / 2 < 0)
        this.pos.x = this.paddle.width / 2;
      if (this.pos.x + this.paddle.width / 2 > gameWindow.X)
        this.pos.x = gameWindow.X - this.paddle.width / 2;

      if (keyIsDown(keyCodesObject.A)) this.pos.add(this.speed.left);
      if (keyIsDown(keyCodesObject.D)) this.pos.add(this.speed.right);

      this.trail = [
        {
          x: this.pos.x,
          y: this.pos.y,
        },
      ];
    }
  }

  traceTrajectory() {
    if (shot) {
      for (let i = 1; i < this.trail.length; i++) {
        push();
        noStroke();
        fill("#FFF");
        circle(this.trail[i].x, this.trail[i].y, this.D * 0.75);
        pop();
      }
    }
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  rev(coord) {
    this.velocity[coord] *= -1;
  }

  resetPos() {
    this.pos = createVector(
      paddle.pos.x,
      paddle.pos.y - paddle.height / 2 - this.rad
    );
  }

  resetSpeed() {
    this.velocity = createVector();
    this.acceleration = createVector();
  }

  outOfBounds() {
    if (
      this.pos.x + this.rad > gameWindow.X ||
      this.pos.x - this.rad < 0 ||
      this.pos.y - this.rad > gameWindow.Y
    ) {
      shot = false;
      this.resetSpeed();
      this.resetPos();
    }
  }
}

class Paddle {
  constructor() {
    this.width = 175;
    this.height = 30;
    this.YOffset = 35;
    this.pos = createVector(
      gameWindow.getMiddleX(),
      gameWindow.Y - this.YOffset
    );

    this.speed = movementSpeed;
  }

  display() {
    fill(colors.gameObjects.paddle);
    rect(this.pos.x, this.pos.y, this.width, this.height, 10);
  }

  move() {
    if (this.pos.x - this.width / 2 <= 0) this.pos.x = this.width / 2;
    if (this.pos.x + this.width / 2 >= gameWindow.X)
      this.pos.x = gameWindow.X - this.width / 2;

    if (keyIsDown(keyCodesObject.A)) this.pos.add(this.speed.left);
    if (keyIsDown(keyCodesObject.D)) this.pos.add(this.speed.right);
  }
}

class Cannon {
  constructor(paddle, ball) {
    this.spaceBarHit = 1;
    this.angle = -PI / 2; // Minus because the Y axis is reversed. Divided by 2 to be poiting straight at the top
    this.height = 150;
    this.width = ball.D;

    this.pos = createVector(
      paddle.pos.x,
      paddle.pos.y - paddle.height - this.height / 2 - ball.rad
    );

    this.speed = movementSpeed;
    this.paddle = paddle;
    this.ball = ball;

    this.gravity = createVector(0, 0.05);
  }

  resetGravity() {
    this.gravity = createVector(0, 0);
  }

  shoot() {
    if (keyIsDown(keyCodesObject.SPACE) && this.spaceBarHit !== 0) {
      this.gravity = createVector(0, 0.05);
      shot = true;
      this.spaceBarHit = 0;

      const force = p5.Vector.fromAngle(this.angle);
      force.mult(15);
      this.ball.applyForce(force);
    }

    if (shot) {
      this.ball.applyForce(this.gravity);
      this.ball.update();
    }

    if (!shot) this.spaceBarHit = 1;
  }

  rotate() {
    const maxLeftAngle = rational(-2.320796326794896);
    const minLeftAngle = rational(-0.805454889999999);

    if (this.angle <= maxLeftAngle) this.angle = maxLeftAngle;
    if (this.angle >= minLeftAngle) this.angle = minLeftAngle;

    if (keyIsDown(LEFT_ARROW)) this.angle -= 0.15;
    if (keyIsDown(RIGHT_ARROW)) this.angle += 0.15;
  }

  display() {
    fill(colors.gameObjects.cannon);
    let translationXVal = this.paddle.pos.x;
    let translationYVal =
      this.paddle.pos.y - this.paddle.height / 2 - this.ball.rad;

    push();
    rectMode(CORNER); // Switching rectModes only for the cannon to allow the cannon to rotate around the cannonball
    if (this.pos.x - this.width / 2 - this.paddle.width / 2 < 0)
      translationXVal += 5;
    if (this.pos.x + this.width / 2 + this.paddle.width / 2 > gameWindow.X)
      translationXVal -= 5;

    translate(translationXVal, translationYVal); // translating is essential for rotation
    rotate(this.angle);
    rect(5, -20, this.height, this.width, 5, 0, 0, 5);
    pop();
  }
}

class Pillar {
  constructor(pos, type, direction = "none") {
    this.pos = pos;
    this.type = type;
    this.direction = direction;
    this.retreatSpeed = 20;

    this.normalPillarWidth = pillars.width;
    this.normalPillarHeight = pillars.height;
    this.protectionPillarWidth =
      gameWindow.getMiddleX() - pillars.width * 1.5 + bugFixVal * 2;
    this.protectionPillarHeight = 60;
  }

  display() {
    fill(colors.gameObjects.pillars);
    if (this.type === "normal")
      rect(
        this.pos.x,
        this.pos.y,
        this.normalPillarWidth,
        this.normalPillarHeight,
        0,
        0,
        5,
        5
      );

    if (this.type === "protection") {
      push();
      noStroke();
      rect(
        this.pos.x,
        this.pos.y,
        this.protectionPillarWidth,
        this.protectionPillarHeight
      );
      pop();
    }

    push();
    stroke("#000");
    line(
      this.normalPillarWidth,
      this.protectionPillarHeight,
      gameWindow.getMiddleX() - this.normalPillarWidth / 2,
      this.protectionPillarHeight
    );

    line(
      gameWindow.getMiddleX() + this.normalPillarWidth / 2,
      this.protectionPillarHeight,
      gameWindow.X - this.normalPillarWidth,
      this.protectionPillarHeight
    );
    pop();
  }

  retreat() {
    if (this.type === "protection") {
      if (this.direction === "left") this.pos.add(-this.retreatSpeed);
      if (this.direction === "right") this.pos.add(this.retreatSpeed);
    }
  }
}

class Projectile {
  constructor(brick) {
    this.width = 10;
    this.height = 15;

    this.pos = createVector(brick.pos.x, brick.pos.y);
    this.velocity = createVector(0, 1);
    this.initialY = brick.pos.y;
  }

  display() {
    push();
    noStroke();
    fill(colors.gameObjects.projectile);
    rect(this.pos.x, this.pos.y, this.width, this.height, 0, 0, 5, 5);
    pop();
  }

  move() {
    if (this.pos.y > gameWindow.Y) {
      this.pos.x = gameWindow.getMiddleX();
      this.pos.y = this.initialY;
    } else this.pos.add(this.velocity);
  }

  hitsPaddle(paddle) {
    if (
      paddle.pos.x + paddle.width / 2 >= this.pos.x - this.width / 2 &&
      paddle.pos.x - paddle.width / 2 <= this.pos.x + this.width / 2 &&
      paddle.pos.y + paddle.height / 2 >= this.pos.y - this.height / 2 &&
      paddle.pos.y - paddle.height / 2 <= this.pos.y + this.height / 2
    )
      return true;
  }
}

class Brick {
  constructor(pos, width, height) {
    this.pos = pos;
    this.width = width;
    this.height = height;
    this.points = 1;
    this.shoots = Math.random() > 0.5; // Does the brick shoot a projectile towards the player?
    this.isDestroyed = false;
  }

  display() {
    fill(colors.gameObjects.bricks);
    rect(this.pos.x, this.pos.y, this.width, this.height);
  }

  isBallColliding(ball) {
    if (
      ball.pos.x + ball.D / 2 >= this.pos.x - this.width / 2 &&
      ball.pos.x - ball.D / 2 <= this.pos.x + this.width / 2 &&
      ball.pos.y + ball.D / 2 >= this.pos.y - this.height / 2 &&
      ball.pos.y - ball.D / 2 <= this.pos.y + this.height / 2
    )
      return true;
  }
}

// **************************************************** //

/// Game Objects
let pillar_1;
let pillar_2;
let pillar_3;
let pillar_4;
let pillar_5;

let paddle;
let ball;
let cannon;

// **************************************************** //

/// Setup and Draw Functions

function setup() {
  gameWindow.X = displayWidth;
  gameWindow.Y = displayHeight;

  movementSpeed = {
    right: createVector(gameWindow.X / 120, 0),
    left: createVector(-gameWindow.X / 120, 0),
  };

  pillar_1 = new Pillar(
    createVector(pillars.width / 2, pillars.height / 2),
    "normal"
  );
  pillar_2 = new Pillar(
    createVector(gameWindow.getMiddleX(), pillars.height / 2),
    "normal"
  );
  pillar_3 = new Pillar(
    createVector(gameWindow.X - pillars.width / 2, pillars.height / 2),
    "normal"
  );

  pillar_4 = new Pillar(
    createVector((gameWindow.getMiddleX() + pillars.width / 2) / 2, 90),
    "protection",
    "left"
  );
  pillar_5 = new Pillar(
    createVector(
      gameWindow.X - gameWindow.getMiddleX() / 2 - pillars.width / 4,
      90
    ),
    "protection",
    "right"
  );

  paddle = new Paddle();
  ball = new Ball(paddle, pillar_1, pillar_2, pillar_3, pillar_4, pillar_5);
  cannon = new Cannon(paddle, ball);

  const bricksArr = [
    createBricks(pillars.width),
    createBricks(gameWindow.getMiddleX() + pillars.width / 2),
  ];
  bricksArr.shift(); // For some reason I was getting twice the amount of bricks I needed to get
  bricks = bricksArr.flat();

  projectiles = createProjectiles();

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
/**
 * Methods and functions that are always rendering no matter the game state
 */
function allTimeState() {
  paddle.display();
  manageBricks();
  // manageProjectiles();

  pillar_1.display();
  pillar_2.display();
  pillar_3.display();
  pillar_4.display();
  pillar_5.display();

  displayScore();
}

/**
 * Methods and functions when the game is running and the player hasn't lost yet. Also takes care of the loss and the winning stage.
 */
function playingState() {
  ball.bounceEdge();
  ball.bouncePillar();
  ball.collidePaddle();
  ball.outOfBounds();
  ball.display();
  ball.updatePos();
  ball.traceTrajectory();

  createProjectiles();

  cannon.display();
  cannon.shoot();
  cannon.rotate();

  paddle.move();

  if (gameState === "lose") endGame();
  if (bricks.length === 0) {
    pillar_4.retreat();
    pillar_5.retreat();

    gameState = "win"; // this needs to be delayed until the protection pillars have retreated and the prisoners are out
  }
}

/**
 * Ends the game and displays the end game message
 */
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

/**
 * Displays the score to the user
 */
function displayScore() {
  textSize(scoreText.textSize);
  fill(colors.text.score);
  text(`Score: ${playerScore}`, scoreText.X, scoreText.Y);
}

let bricks = [];

/**
 *
 * @param { number } xOffSet OffSet value on the Y axis due to the pillars existing.
 * @returns an Array containing all the bricks. This fucntion is essential for the game to work properly
 */
function createBricks(xOffSet) {
  const rows = 5;
  const bricksPerRow = 5;
  const brickSize = {
    width: (gameWindow.getMiddleX() - pillars.width * 1.5) / bricksPerRow,
    height: 30,
  };

  let brick;
  const yOffSet = brickSize.height * 4;

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

let projectiles = [];

/**
 * Creates the projectiles and calls their appropriate methods. It also deals with bricks getting destroyed on the map.
 */
function createProjectiles() {
  const enemyBricks = bricks.filter((x) => x.shoots === true);

  for (let brick of enemyBricks) {
    let projectile = new Projectile(brick);
    projectile.display();
    projectiles.push(projectile);
  }

  return projectiles;
}

/**
 * Manages the bricks, removes bricks that have been hit by the ball and otherwise displays the remaining bricks. Additionally it's used to reset the gravity of the cannonball to remove the initial velocity at which the ball might be thrown after a hit on a brick.
 */
function manageBricks() {
  for (let i = bricks.length - 1; i >= 0; i--) {
    const brick = bricks[i];

    if (brick.isBallColliding(ball)) {
      shot = false;

      cannon.resetGravity();
      ball.resetSpeed();
      ball.resetPos();

      bricks.splice(i, 1);
      playerScore += brick.points;
    } else brick.display();
  }
}

function manageProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];

    if (projectile.hitsPaddle(paddle)) gameState = "lose";
    else {
      projectile.display();
      projectile.move();
    }
  }
}

/**
 * Used to fullscreen the game. P5.js calls this function on it's own, it just needs to be defined to work.
 */
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
/**
 * Used to generate a random color between black and white, in hexadecimal forma
 * @returns random hexadecimal code (#000000)
 */
function randomColor() {
  return "#" + Math.trunc(Math.random() * 0xfff).toString(16);
}

/**
 * Turns an irrational number into a rational number with 2 decimal points.
 * @param { number } num
 * @returns The irrational number made rational
 */
function rational(num) {
  return Number(num.toFixed(2));
}

// !! Not so sure if I'm going to refactor the code with this function, keep in mind that the $ sign doesn't look that neat and that descriptive
/**
 * A simple function that divides a number by 2
 * @param { number } val Value we'd like to divide
 * @returns val / 2
 */
function $(val) {
  return val / 2;
}
