/// Fundamental Objects

const gameWindow = {
  getMiddleX(depth = 1) {
    return gameWindow.X / (2 * depth);
  },
  getMiddleY(depth = 1) {
    return gameWindow.Y / (2 * depth);
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
    prisoners: "#EED0B6",
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
  P: 80,
  R: 82,
  T: 84,
  W: 87,
  SPACE: 32,
};

// **************************************************** //

/// Basic Variables

const onePx = 1; // pixels

let shot = false;
let retreated = false;
let prisonersOut = false;

let TKeyHit = 0;
let playerScore = 0;
let gameState = "playing";

// **************************************************** //

/// Fundamental Classes
class Ball {
  constructor(paddle, ...pillars) {
    this.rad = 20;
    this.D = this.rad * 2;
    this.pos = createVector(
      paddle.pos.x,
      paddle.pos.y - paddle.height / 2 - this.rad
    );
    this.velocity = createVector();
    this.acceleration = createVector();
    this.topSpeed = 18;

    this.speed = movementSpeed;

    this.paddle = paddle;
    this.pillars = pillars;

    this.trail = [];
    this.yHitCount = 0;

    this.updates = 0;
    this.growthRate = 1.5;
    this.grownTimes = 0;

    this.original = true;
    this.duplicated = false;
  }

  collidePaddle() {
    if (
      this.pos.x - this.rad < this.paddle.pos.x + this.paddle.width / 2 &&
      this.pos.x + this.rad > this.paddle.pos.x - this.paddle.width / 2 &&
      this.pos.y + this.rad > this.paddle.pos.y - this.paddle.height / 2 &&
      shot
    )
      gameState = "lose";
  }

  bouncePillar() {
    const normalPillars = this.pillars.filter((x) => x.type === "normal");
    const protectionPillars = this.pillars.filter(
      (x) => x.type === "protection"
    );

    for (let pillar of protectionPillars) {
      // prettier-ignore
      if (
        this.pos.x + this.rad > pillar.pos.x - pillar.width / 2 &&
        this.pos.x - this.rad < pillar.pos.x + pillar.width / 2 &&
        this.pos.y - this.rad < pillar.pos.y + pillar.height / 2
      )
        this.rev("y");
    }

    for (let pillar of normalPillars) {
      if (
        this.pos.x + this.rad > pillar.pos.x - pillar.width / 2 &&
        this.pos.x - this.rad < pillar.pos.x + pillar.width / 2 &&
        this.pos.y + this.rad < pillar.height
      )
        this.rev("x");

      if (
        this.pos.x + this.rad >= pillar.pos.x - pillar.width / 2 &&
        this.pos.x - this.rad <= pillar.pos.x + pillar.width / 2 &&
        this.pos.y - this.rad <= pillar.height &&
        this.pos.y + this.rad >= pillar.height
      ) {
        this.rev("y");
        this.yHitCount++;
      }

      // This check is here to not allow the ball from bouncing in the pillar when it hits the corner of the pillar. Not my smoothest work but it sure does the job
      if (this.yHitCount >= 2) {
        this.rev("y");
        this.rev("x");
        this.yHitCount = 1;
      }
    }
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

      // Make the ball move at the same time with the paddle when dashing
      if (keyIsDown(keyCodesObject.A) && keyIsDown(keyCodesObject.W))
        this.pos.add(this.speed.left);

      if (keyIsDown(keyCodesObject.D) && keyIsDown(keyCodesObject.W))
        this.pos.add(this.speed.right);

      this.trail = [];
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

  grow() {
    if (bricks.length % 5 !== 0) this.updates = 1;

    if (bricks.length % 5 === 0 && this.updates === 1) {
      this.rad += this.growthRate;
      this.D += this.growthRate * 2;
      this.updates = 0;
      this.grownTimes++;
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
      this.yHitCount = 0;
    }
  }
}

class BallDuplicate {
  // FIXME: Duplicate doesn't bounce off pillars on it's own

  constructor(ball, paddle, ...pillars) {
    this.pos = createVector(ball.pos.x + ball.D, ball.pos.y);
    this.rad = ball.rad;
    this.D = ball.D;

    this.velocity = createVector();

    this.ball = ball;
    this.paddle = paddle;
    this.pillars = pillars;

    this.trail = [];
    this.yHitCount = 0;

    this.original = false;
  }

  collidePaddle() {
    if (
      this.pos.x - this.rad < this.paddle.pos.x + this.paddle.width / 2 &&
      this.pos.x + this.rad > this.paddle.pos.x - this.paddle.width / 2 &&
      this.pos.y + this.rad > this.paddle.pos.y - this.paddle.height / 2 &&
      shot
    )
      gameState = "lose";
  }

  bouncePillar() {
    const normalPillars = this.pillars.filter((x) => x.type === "normal");
    const protectionPillars = this.pillars.filter(
      (x) => x.type === "protection"
    );

    for (let pillar of protectionPillars) {
      if (
        this.pos.x + this.rad > pillar.pos.x - pillar.width / 2 &&
        this.pos.x - this.rad < pillar.pos.x + pillar.width / 2 &&
        this.pos.y - this.rad < pillar.pos.y + pillar.height / 2
      )
        this.rev("y");
    }

    for (let pillar of normalPillars) {
      if (
        this.pos.x + this.rad > pillar.pos.x - pillar.width / 2 &&
        this.pos.x - this.rad < pillar.pos.x + pillar.width / 2 &&
        this.pos.y + this.rad < pillar.height
      )
        this.rev("x");

      if (
        this.pos.x + this.rad >= pillar.pos.x - pillar.width / 2 &&
        this.pos.x - this.rad <= pillar.pos.x + pillar.width / 2 &&
        this.pos.y - this.rad <= pillar.height &&
        this.pos.y + this.rad >= pillar.height
      ) {
        this.rev("y");
        this.yHitCount++;
      }

      // This check is here to not allow the ball from bouncing in the pillar when it hits the corner of the pillar. Not my smoothest work but it does the job
      if (this.yHitCount >= 2) {
        this.rev("y");
        this.rev("x");
        this.yHitCount = 1;
      }
    }
  }

  display() {
    strokeWeight(2);
    fill(colors.gameObjects.ball);
    circle(this.pos.x, this.pos.y, this.D);
  }

  update() {
    this.pos = createVector(this.ball.pos.x + ball.D, this.ball.pos.y);
    this.rad = this.ball.rad;
    this.D = this.ball.D;

    if (frameCount % 5 === 0)
      this.trail.push({
        x: this.pos.x,
        y: this.pos.y,
      });
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

  resetTrail() {
    this.trail = [];
  }

  rev(coord) {
    this.velocity[coord] *= -1;
  }
}

class Paddle {
  constructor() {
    this.width = 175;
    this.height = 30;
    this.YOffset = 45;
    this.pos = createVector(
      gameWindow.getMiddleX(),
      gameWindow.Y - this.YOffset
    );

    this.speed = movementSpeed;

    this.updates = 0;
    this.growthRate = 10;
    this.grownTimes = 0;
  }

  display() {
    fill(colors.gameObjects.paddle);
    rect(this.pos.x, this.pos.y, this.width, this.height, 10);
  }

  grow() {
    if (bricks.length % 5 !== 0) this.updates = 1;

    if (bricks.length % 5 === 0 && this.updates === 1) {
      this.width += this.growthRate;
      this.updates = 0;
      this.grownTimes++;
    }
  }

  move() {
    if (this.pos.x - this.width / 2 <= 0) this.pos.x = this.width / 2;
    if (this.pos.x + this.width / 2 >= gameWindow.X)
      this.pos.x = gameWindow.X - this.width / 2;

    if (keyIsDown(keyCodesObject.A)) this.pos.add(this.speed.left);
    if (keyIsDown(keyCodesObject.D)) this.pos.add(this.speed.right);

    // Dashing ability to move faster
    if (keyIsDown(keyCodesObject.A) && keyIsDown(keyCodesObject.W))
      this.pos.add(this.speed.left);

    if (keyIsDown(keyCodesObject.D) && keyIsDown(keyCodesObject.W))
      this.pos.add(this.speed.right);
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
      force.mult(this.ball.topSpeed);
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

    if (keyIsDown(LEFT_ARROW)) this.angle -= 0.1;
    if (keyIsDown(RIGHT_ARROW)) this.angle += 0.1;
  }

  display() {
    fill(colors.gameObjects.cannon);
    this.width = this.ball.D;

    // prettier-ignore
    let translationXVal = this.paddle.pos.x - this.ball.growthRate * this.ball.grownTimes;
    // prettier-ignore
    let translationYVal = this.paddle.pos.y - this.paddle.height / 2 - this.ball.rad;

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
    this.retreatSpeed = {
      left: createVector(-10, 0),
      right: createVector(10, 0),
    };

    this.width =
      this.type === "normal"
        ? pillars.width
        : gameWindow.getMiddleX() - pillars.width * 1.5 + onePx * 2; // onePx * 2 makes the horizontal pillars blend with the vertical ones
    this.height = this.type === "normal" ? pillars.height : 60;

    this.lineColor = "#000";
  }

  display() {
    fill(colors.gameObjects.pillars);
    if (this.type === "normal")
      rect(this.pos.x, this.pos.y, this.width, this.height, 0, 0, 5, 5);

    if (this.type === "protection") {
      push();
      noStroke();
      rect(this.pos.x, this.pos.y, this.width, this.height);
      pop();

      push();
      stroke(this.lineColor);
      line(
        pillars.width + onePx * 2,
        this.height,
        gameWindow.getMiddleX() - pillars.width / 2 - onePx * 2,
        this.height
      );

      line(
        gameWindow.getMiddleX() + pillars.width / 2 + onePx * 2,
        this.height,
        gameWindow.X - pillars.width - onePx * 2,
        this.height
      );
      pop();
    }
  }

  retreat() {
    if (this.type === "protection") {
      this.lineColor = colors.background; // Removes the lines

      if (this.direction === "left") this.pos.add(this.retreatSpeed.left);
      if (this.direction === "right") this.pos.add(this.retreatSpeed.right);

      setTimeout(() => (retreated = true), 1000); // it takes about 1 second for the pillars to retreat so the prisoners can get out
    }
  }
}

class Projectile {
  constructor(brick) {
    this.width = 10;
    this.height = 15;
    this.launched = false;

    this.pos = createVector(brick.pos.x, brick.pos.y + this.height / 2);
    this.velocity = createVector(0, 2.5);
    this.newPos = createVector(
      choose(
        pillars.width / 2,
        gameWindow.getMiddleX(),
        gameWindow.X - pillars.width / 2
      ),
      pillars.height - this.height / 2
    );

    this.updates = 0;
    this.growthRate = 1;
    this.grownTimes = 0;
  }

  display() {
    push();
    noStroke();
    fill(colors.gameObjects.projectile);
    rect(this.pos.x, this.pos.y, this.width, this.height, 0, 0, 5, 5);
    pop();
  }

  resetPos(brick) {
    if (this.pos.y > gameWindow.Y) {
      this.launched = false;
      if (luck(80)) this.pos = this.newPos;
      else {
        // prettier-ignore
        this.pos = brick !== undefined ? createVector(brick.pos.x, brick.pos.y + this.height / 2) : this.newPos;
      }
    }
  }

  accelerate() {
    if (bricks.length % 5 !== 0) this.updates = 1;

    if (bricks.length % 5 === 0 && this.updates === 1) {
      this.velocity.add(0, this.growthRate)
      this.updates = 0;
      this.grownTimes++;
    }
  }

  move() {
    if (luck(90)) this.launched = true;
    if (this.launched) this.pos.add(this.velocity);
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
    this.shoots = luck(55); // Does the brick shoot a projectile towards the player?
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

class Prisoner {
  constructor() {
    this.height = 20;
    this.width = 15;

    // prettier-ignore
    this.xOffSet = luck(50) ? pillars.width : gameWindow.getMiddleX() + pillars.width / 2; // Side where the prisoners spawn
    this.widthBetweenPillars = 580; // Real value is 585, removing 5 pixels to fix a bug
  }

  setPos() {
    let randomX = Math.trunc(
      this.xOffSet + Math.random() * this.widthBetweenPillars
    );
    this.pos = createVector(randomX, 30);
  }

  display() {
    fill(colors.gameObjects.prisoners);
    ellipse(this.pos.x, this.pos.y, this.width, this.height);
  }

  idle() {
    if (
      frameCount % 15 === 0 &&
      this.pos.x - this.width / 2 > this.xOffSet &&
      this.pos.x + this.width / 2 < this.xOffSet + this.widthBetweenPillars
    )
      this.pos.add(createVector(randomlyMakeNegative(Math.random() * 5), 0));
  }

  free() {
    if (retreated && this.pos.y <= gameWindow.getMiddleY())
      this.pos.add(createVector(0, 2));
    if (this.pos.y >= gameWindow.Y / 2) prisonersOut = true;
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
let duplicate;
let cannon;

/// Game Object Arrays

let prisoners = [];
let projectiles = [];
let bricks = [];

/// Game Buttons
let resumeBtn;
let tutorialBtn;

// **************************************************** //

/// Setup and Draw Functions

function setup() {
  gameWindow.X = displayWidth;
  gameWindow.Y = displayHeight;

  movementSpeed = {
    right: createVector(gameWindow.X / 150, 0),
    left: createVector(-gameWindow.X / 150, 0),
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

  const allPillars = [pillar_1, pillar_2, pillar_3, pillar_4, pillar_5];

  paddle = new Paddle();
  ball = new Ball(paddle, ...allPillars);
  duplicate = new BallDuplicate(ball, paddle, ...allPillars);
  cannon = new Cannon(paddle, ball);

  createBricks(pillars.width);
  createBricks(gameWindow.getMiddleX() + pillars.width / 2);

  createProjectiles();
  createPrisoners();

  scoreText.X = gameWindow.X - scoreText.textSize * 6;
  scoreText.Y = 50;
  gameStateText.X = gameWindow.getMiddleX() - gameStateText.textSize * 2;
  gameStateText.Y = gameWindow.getMiddleY();

  resumeBtn = {
    x: gameWindow.getMiddleX(2),
    y: gameWindow.getMiddleY(),
    width: 300,
    height: 200,
  };

  tutorialBtn = {
    x: gameWindow.X - gameWindow.getMiddleX(2),
    y: gameWindow.getMiddleY(),
    width: 300,
    height: 200,
  };

  createCanvas(gameWindow.X, gameWindow.Y);
  rectMode(CENTER);
}

function draw() {
  background(colors.background);
  if (keyIsDown(keyCodesObject.P) || gameState === "paused") pauseMenu();
  if (gameState !== "paused") {
    allTimeState();

    if (gameState === "playing") playingState();
    else endGame();
  }
}

// **************************************************** //

/// Fundamental Functions
/**
 * Methods and functions that are always rendering no matter the game state
 */
function allTimeState() {
  paddle.display();
  manageBricks(ball);
  managePrisoners();

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
  ball.bouncePillar();
  ball.collidePaddle();
  ball.outOfBounds();
  ball.display();
  ball.updatePos();
  ball.traceTrajectory();
  ball.grow();

  cannon.display();
  cannon.shoot();
  cannon.rotate();

  paddle.move();
  paddle.grow();

  manageDuplicate();
  manageProjectiles();

  if (gameState === "lose") endGame();
  if (bricks.length === 0) {
    pillar_4.retreat();
    pillar_5.retreat();

    if (prisonersOut) gameState = "win";
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
 * Pauses and resumes the game to display a settings menu
 */
function pauseMenu() {
  background(0);
  gameState = "paused";

  push();
  textAlign(CENTER);

  fill("white");
  stroke("black");
  strokeWeight(3);

  rect(...vals(resumeBtn));
  text("Resume", resumeBtn.x, resumeBtn.y);

  rect(...vals(tutorialBtn));
  text("How To Play", tutorialBtn.x, tutorialBtn.y);
  pop();

  if (keyIsDown(keyCodesObject.R)) {
    gameState = "playing";
  }
}

function showKeys() {
  background(0);
  fill(colors.text.score);
  text(
    `Hello and Welcome to the control panel of the Breaky Game!\n

    I'm SmashMaster Assistant, I'm going to instruct you how to play the game and hopefully win!\n\n

    The goal of the game is to destroy all of the bricks and free the prisoners. You're armed with a cannon that shoots an unlimited amount of cannonballs one at a time. The issue is, you're also getting attacked by other projectiles! You can escape them by moving the paddle on which you stand on, the more bricks you destroy the easier the game becomes.
    \n\n
    Basic Key Presses:
      - Use the A/D keys to move the paddle left/right.
      - Use the arrow keys to rotate the cannon in the desired direction.
      - Use the P key to pause the menu. Use the R key to go back to playing the game.
    \n\n
    Advanced Key Presses:
      - Click on the W key while clicking on the A/D key to implement a dash in the desired direction\n
      - Use the T key to duplicate the ball while in the air. Watch out, a bad throw might be more detrimental than you think.\n

    \n\n
    The Code can be found at https://github.com/Arthur-Morgan36/Breaky-Game
  `,
    500,
    250
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

/**
 * Creates the projectiles and calls their appropriate methods. It also deals with bricks that can no longer shoot projectiles because they're gone.
 */
function createProjectiles() {
  const enemyBricks = bricks.filter((x) => x.shoots === true);
  for (let brick of enemyBricks) projectiles.push(new Projectile(brick));

  return projectiles;
}

/**
 * Creates the prisoners and sets their position while pushing them to an array for further use.
 */
function createPrisoners() {
  const prisonersCount = 15;
  for (let i = 0; i < prisonersCount; i++) {
    let prisoner = new Prisoner();
    prisoner.setPos();
    prisoners.push(prisoner);
  }
}

/**
 * Manages the bricks, removes bricks that have been hit by the ball and otherwise displays the remaining bricks. Additionally it's used to reset the gravity of the cannonball to remove the initial velocity at which the ball might be thrown after a hit on a brick.
 */
function manageBricks(ball) {
  for (let i = bricks.length - 1; i >= 0; i--) {
    const brick = bricks[i];

    if (brick.isBallColliding(ball)) {
      if (ball.original) {
        shot = false;

        cannon.resetGravity();
        ball.resetSpeed();
        ball.resetPos();
      } else ball.resetTrail();

      bricks.splice(i, 1);
      playerScore += brick.points;
    } else brick.display();
  }
}

function manageProjectiles() {
  const enemyBricks = bricks.filter((x) => x.shoots === true);

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];

    if (projectile.hitsPaddle(paddle)) gameState = "lose";
    else {
      projectile.display();
      projectile.move();
      projectile.accelerate();
      projectile.resetPos(enemyBricks[i]);
    }
  }
}

/**
 *  Displays the prisoners and make's them idle a bit. If the game is won the prisoners move outside of the prison.
 */
function managePrisoners() {
  for (let prisoner of prisoners) {
    prisoner.display();
    prisoner.idle();

    prisoner.free();
  }
}

/**
 * Manages the duplicate of the ball, everything from spawning to dealing with collisions and updating the ball's properties and visuals.
 */
function manageDuplicate() {
  if (!shot) {
    ball.duplicated = false;
    duplicate.resetTrail();
  }

  if (
    shot &&
    (keyIsDown(keyCodesObject.T) || ball.duplicated) &&
    ball.grownTimes < 1
  ) {
    if (keyIsDown(keyCodesObject.T) && TKeyHit < 1) {
      ball.pos = createVector(ball.pos.x - ball.D, ball.pos.y);
      TKeyHit++;
      noLoop();
    }

    if (!shot) TKeyHit = 0;

    loop();
    duplicate.bouncePillar();
    duplicate.collidePaddle();
    duplicate.display();
    duplicate.update();
    duplicate.traceTrajectory();

    manageBricks(duplicate);

    ball.duplicated = true;
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
    mouseY < gameWindow.Y &&
    gameState !== "paused"
  ) {
    let fs = fullscreen();
    fullscreen(!fs);
  }

  if (
    mouseX > resumeBtn.x - resumeBtn.width &&
    mouseX < resumeBtn.x + resumeBtn.width &&
    mouseY > resumeBtn.y - resumeBtn.height &&
    mouseY < resumeBtn.y + resumeBtn.height
  )
    gameState = "playing";

  if (
    mouseX > tutorialBtn.x - tutorialBtn.width &&
    mouseX < tutorialBtn.x + tutorialBtn.width &&
    mouseY > tutorialBtn.y - tutorialBtn.height &&
    mouseY < tutorialBtn.y + tutorialBtn.height
  )
    showKeys();
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
 * @param { number } num irrational number
 * @returns The irrational number made rational
 */
function rational(num) {
  return Number(num.toFixed(2));
}

/**
 * Randomly makes a value negative or not
 * @param { number } val Value to be made randomly negative
 * @returns randomly made negative value
 */
function randomlyMakeNegative(val) {
  return luck(50) ? -val : val;
}

/**
 * Chooses a random value between one of the provided values
 * @param { Array } vals an array of chosen values
 * @returns One of the entered values
 */
function choose(...vals) {
  return vals[Math.trunc(Math.random() * vals.length)];
}

function vals(obj) {
  return Object.values(obj);
}

/**
 * The point of this function is to make something more unlikely to happen. The bigger `val` is, the smaller the chance of happening.
 * @param { number } val It's a value between 0 and 100
 * @returns true or false
 */
function luck(val) {
  return Math.random() >= val / 100;
}
