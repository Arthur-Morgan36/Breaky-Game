# Breaky Eggy

## ☍ Code
The game can be played at [editor.p5js](https://editor.p5js.org/Arthur-Morgan36/sketches/wttbwiCqo).

Click on the play button then on the canvas to enter fullscreen, be sure to click the `H` key to toggle the tutorial and remind yourself of the controls! Have fun!!!

## ☍ Game Overview
The player is immersed into a 2D dimension.

The player suddenly finds himself in front of an enemy castle. All of his egg friends are trapped behind bars.
The player is armed with a cannon that shoots one ball at a time. He can move the platform he's on or rotate the cannon to control the direction of the shot. The player wants to destroy all of the bricks that make the enemy's castle. Once destroyed, he can free his egg friends. However, as he attacks the castle, the enemy attacks back with orange projectiles that are shot from random places. Nowhere is safe, it's either him or his friends. 

The game changes constantly, as the number of bricks shrinks, the enemy increases the speed of his projectiles and starts shooting projectiles from new places. Additionally, you grow stronger and bigger the more bricks you destroy, this is an advantage when it comes to the ball but a disadvantage when it comes to the paddle or the cannon. The pillars also get bigger, making a missed shot even more dangerous. 

---

<br>

## ☍ Game Details
### &diams; Game Logic
**Basic Key Presses**:
  - Use the A/D keys to move the paddle left/right.
  - Use the left and right arrow keys to rotate the cannon in the desired direction.
  - Use the P key to pause the menu.
  - Use the H key to toggle the instructions panel.
  - Use the R key to go back to playing the game.

**Advanced Key Presses**:
  - Use the W key while clicking on the A/D key to implement a dash in the desired direction.\n
  - Use the T key to duplicate the ball while in the air. Watch out, a bad throw might be more detrimental than you think.

<br>

### &diams; Game Objects
On the map, we find the following items:
  ```
      - Paddle: Player's position, way of moving and escaping the projectiles
      - Cannon: Shooting pattern for the ball
      - Ball: Weapon used to destroy bricks
      - Bricks: Enemy target, destruction increases score
      - Projectile: Enemy counterattack
      - Pillar: Structure, can play in favor of the player or against him
  ```

---

<br>

## ☍ Team Overview
### ✪ Team Name
10X
### ✪ Team Members
Game designed and developed by **Alexandre Hatem**.

*Note:* This is a solo project to allow me to test my limits to the end and see how far I have come during my programming journey of an and a half years.

---

<br>

## ☍ Coding Details
### ☛ Coding Structure
The structure of the code is relatively simply, at the top we've got global variables that are essential for the game to run properly. They also do not allow repetition in many places, some of them are called more than 15 times. We've also got the classes for the game objects, each game object having it's own class. 

In the setup function, most game objects are initialized and some essential functions such as `rectMode(CENTER)` are called. The draw function is just below, it's about 4-6 lines, because everything is controlled through other functions. 

The game states are controlled through functions, and the interractions between the game objects that are repetitive are also managed towards the bottom of the code.
At the end, there's helper functions, peaces of code that were called many times and pieces of code that were simply way better put in a function for the syntax of the code.

The code is about 1400 lines, I've left a few JSDOC and normal comments to explain what each piece of code does. 

!!! NOTE: There's currently a piece of code that doesn't work insanely well, I'm currently very busy with exams and I lack the time to fix it. 

