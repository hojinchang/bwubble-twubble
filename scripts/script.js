"use-strict"

/* ********************************************
                     Robot
*********************************************** */
class Robot {
    constructor(
        characterElement, 
        characterIcon, 
        gameBoardElement,
    ) {
        this.characterElement = characterElement;
        this.characterIcon = characterIcon;
        this.gameBoardElement = gameBoardElement;
        this.width = this.characterElement.clientWidth;
        this.height = this.characterElement.clientHeight;
        this.boardWidth = this.gameBoardElement.clientWidth;
        this.boardHeight = this.gameBoardElement.clientHeight;

        this.idleState = "../assets/character/Idle-1.png";
        this.isRunning = false;
        this.runAnimationFrame;
        this.runIdx = 0;
        this.direction;
        this.xPosition;

        this.laserObject;
        this.isLaserActive;

        this.runImages = this._getRunImages();
        this._runAnimation = this._runAnimation.bind(this);
        this._laserAnimation = this._laserAnimation.bind(this);
    }

    _getRunImages() {
        const runImages = [];
        for (let i = 0; i < 8; i++) {
            const image = new Image();
            image.src = `../assets/character/Run-${i+1}.png`;
            runImages.push(image);
        }
        return runImages;
    }


    /* 
        Cycle through runImages array to animate running.
        Move the character with a step of 2px when running
    */
    _runAnimation() {
        this.characterIcon.src = this.runImages[this.runIdx].src;
        
        this.xPosition = parseInt(this.characterElement.style.left);   // Current xPosition
        const step = 2;

        // Update the xPosition depending on if moving left or right
        (this.direction === "left") 
            ? this.xPosition = this.xPosition - step 
            : this.xPosition = this.xPosition + step;

        // Set xPosition limits to be the edges of the game board
        if ((this.xPosition + this.width) >= this.boardWidth) {
            this.xPosition = this.boardWidth - this.width;
        } else if (this.xPosition <= 0) {
            this.xPosition = 0;
        }

        this.characterElement.style.left = `${this.xPosition}px`;

        // Update the run image index and reset back to 0
        this.runIdx = (this.runIdx + 1) % this.runImages.length;

        // Rerun the animation frame because it only runs once
        this.runAnimationFrame = requestAnimationFrame(() => this._runAnimation());
    }

    // Run method
    run(direction) {
        if (!this.isRunning) {
            this.isRunning = true;
            this.direction = direction;

            (this.direction === "left") 
                ? this.characterElement.classList.add("flip-character") 
                : this.characterElement.classList.remove("flip-character");

            this._runAnimation();
        }
    }

    _laserAnimation(yLaserStart) {
        // this.isLaserActive is set false in the GameController when a collision between the laser and ball is detected
        // Break out of the laser animation when collision occurs
        if (!this.isLaserActive) {
            return;
        }

        // Increase the height of the laser object's property and laser DOM element
        const step = 4;
        this.laserObject.height += step;
        this.laserObject.laserElement.style.height = `${this.laserObject.height}px`;

        /*
            Since the origin is the top left corner of the board, with positive y direction downwards, 
            increasing the height increases the lasers height in the downward direction. The top offset
            is changed to counteract the laser's growth downward.
        */
        const laserOffset = yLaserStart - this.laserObject.height;
        this.laserObject.laserElement.style.top = `${laserOffset}px`
        
        /*
            If the laser's height reaches the top of the screen, stop the laser animation and delete the laser
            from the DOM and its instance.
            Else, continue the laser animation.
        */
        if ((this.laserObject.height + this.height/2) >= this.boardHeight) {    // Since the laser starts from the center of the robot, half of the character height must be added to the laser height to "reach" the top of the gameboard
            this.laserAnimationFrame = cancelAnimationFrame(this.laserAnimationFrame);
            this.isLaserActive = false;

            this.laserObject.delete();   // Delete the laser object and DOM element
            this.laserObject = null;   // Remove laserObject from robot class
        } else {
            this.laserAnimationFrame = requestAnimationFrame(() => this._laserAnimation(yLaserStart));
        }
    }

    // Shoot method
    shoot(laser) {
        // Only shoot if there is no lasers active
        if (!this.isLaserActive) {
            this.isLaserActive = true;
            this.laserObject = laser;
 
            const yLaserStart = this.boardHeight - this.height/2;
            this._laserAnimation(yLaserStart);
        }
    }
    
    // Stop running method
    stopRunning() {
        this.runAnimationFrame = cancelAnimationFrame(this.runAnimationFrame);
        this.isRunning = false;
        this.characterIcon.src = this.idleState;
    }
}
/* ********************************************
                     Robot
*********************************************** */


/* ********************************************
                     Laser
*********************************************** */
class Laser {
    constructor(
        laserElement
    ) {
        this.laserElement = laserElement;
        this.height = 0;
        this.width = parseInt(this.laserElement.style.width);
    }

    delete() {
        this.laserElement.remove();
    }
}
/* ********************************************
                     Laser
*********************************************** */


/* ********************************************
                    Ball 
*********************************************** */
const gravity = 0.05;  // Gravity constant
class Ball {
    constructor(
        ballElement,
        id,
        xVelocity, 
        yVelocity, 
        bounceHeight,
        gameBoardElement,
    ) {
        this.id = id;
        this.ballElement = ballElement;  // ball DOM element
        this.gameBoardElement = gameBoardElement;   // gameboard DOM element
        this.width = this.ballElement.clientWidth;   // ball width
        this.height = this.ballElement.clientHeight;  // ball height
        this.xPosition = parseInt(this.ballElement.style.left);  // Horizontal position
        this.yPosition = parseInt(this.ballElement.style.top);   // Vertical position

        this.xVelocity = xVelocity;  // Horizontal velocity
        this.yVelocity = yVelocity;  // Vertical velocity
        this.bounceHeight = bounceHeight;  // Bounce height of balls in pixels
        this.boardWidth = this.gameBoardElement.clientWidth;
        this.boardHeight = this.gameBoardElement.clientHeight;

        this.bounceAnimationFrame;
        this.isDeleted = false;

        this._onPositionChange;
        this.bounce = this.bounce.bind(this);
        this.delete = this.delete.bind(this);
    }

    // Ball position tracking code from chatGPT. 
    // set up a callback function to track the x/y position of the ball in the GameController class
    set onPositionChangeCallback(callbackFunction) {
        this._onPositionChange = callbackFunction;
    }

    bounce() {
        if (this.isDeleted) {
            return;
        }

        // Ball Drop
        this.yVelocity += gravity;  // a = dy/dt  =>  dy = a*dt  =>  dy_f - dy_i = a*dt  =>  dy_f = a*dt + dy_i  =>  where dt = each animation frame
        this.yPosition += this.yVelocity;  // v = dx/dt  =>  dx = v*dt  =>  dx_f - dx_i = v*dt  =>  dx_f = v*dt + dx_i  =>  where dt = each animation frame
        this.xPosition += this.xVelocity;
        
        // Bounce
        if (this.yPosition > (this.boardHeight - this.height)) {
            /*  To bring a ball back to a specified height, we must calculate the velocity required to
                bounce the ball back to the height. Assuming elastic collision with no losses, the velocity 
                down = velocity up. Thus, the final velocity of a ball as its dropped from a specified height 
                is equal to the inital velocity of a ball as it collides with the floor and bounces back up.
    
                vf^2 = vi^2 + 2ad    // Assume that the ball is dropped with an initial velocity of 0
                vf^2 = 2ad
                vf = sqrt(2ad)
            */
            this.yVelocity = -Math.sqrt(2 * gravity * this.bounceHeight);  // Negative sign because in this context, down is positive and up is negative
        }
        
        // Switch bounce direction if it hits the side walls
        if (this.xPosition > (this.boardWidth - this.width) || this.xPosition < 0) {
            this.xVelocity *= -1;
        }
    
        this.ballElement.style.top = `${this.yPosition}px`;
        this.ballElement.style.left = `${this.xPosition}px`;

        if (this._onPositionChange) {   //  if callback function is set, execute it
            this._onPositionChange();
        }
        
        this.bounceAnimationFrame = requestAnimationFrame(() => this.bounce());
    }

    delete() {
        this.isDeleted = true;
        cancelAnimationFrame(this.bounceAnimationFrame);
        this.bounceAnimationFrame = null;
        this._onPositionChange = null;  // Stop callback function
        this.ballElement.remove();  // Remove ball element from DOM
    }
}

const ballSizes = {
    ball1: {
        width: 20,
        height: 20,
        bounceHeight: 115,
        id: 1,
    },
    ball2: {
        width: 32,
        height: 32,
        bounceHeight: 175,
        id: 2,
    },
    ball3: {
        width: 60,
        height: 60,
        bounceHeight: 250,
        id: 3,
    },
    ball4: {
        width: 90,
        height: 90,
        bounceHeight: 300,
        id: 4,
    },
    ball5: {
        width: 115,
        height: 115,
        bounceHeight: 350,
        id: 5,
    }
}
/* ********************************************
                    Ball 
*********************************************** */



class GameController {
    constructor(devmode = false) {
        this.devmode = devmode;

        this.elements = {};
        this._getElements();

        this.ballImages = this._getBallImages();

        this.robotObject;
        this.laserObject;
        this.gameBoard = this.elements.gameBoard;
        this.ballsKilled = 0;

        if (this.devmode) this._devmode();

        this.currentLevel = 0;
        this.levels = [
            {   
                ballSrc: this.ballImages[0],
                balls: [
                    {
                        ballSize: ballSizes.ball3,
                        id: 3,
                        xPosition: 500,
                        yPosition: 200,
                        xVelocity: 1,
                        yVelocity: 0,
                    },
                ],
            },
            {
                ballSrc: this.ballImages[1],
                balls: [
                    {
                        ballSize: ballSizes.ball4,
                        id: 4,
                        xPosition: 500,
                        yPosition: 200,
                        xVelocity: 1,
                        yVelocity: 0,
                    },
                ],
            }
        ];

        this.playLevel(this.currentLevel);
        // this.playLevel(1);
    }

    // Collect the required DOM elements
    _getElements() {
        this.elements.introScreen = document.querySelector(".intro-screen");
        this.elements.startGameBtn = document.querySelector(".start-game-btn");
        this.elements.gameBoard = document.querySelector(".game-board");
        this.elements.character = document.querySelector(".character-container");
        this.elements.characterIcon = document.querySelector(".character-icon");
    }

    // Set up event listeners
    _setUpEventListeners() {
        // Robot arrow key controls pt.1
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowRight") {
                this.robotObject.run("right");
            } else if (e.key === "ArrowLeft") {
                this.robotObject.run("left");
            } else if (e.key === " " && !this.robotObject.isLaserActive) {
                const laserElement = this._createLaserElement();
                this.laserObject = new Laser(laserElement);
                this.robotObject.shoot(this.laserObject);
            }
        })

        // Robot arrow key controls pt.2
        document.addEventListener("keyup", (e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                this.robotObject.stopRunning();
            }
        })


        if (!this.devmode) {
            this.elements.startGameBtn.addEventListener("click", () => {this._startGame()});
            this.elements.introScreen.addEventListener("transitionend", () => {this._startGame(true)});
        }
    }

    // Load ball images into image object
    _getBallImages() {
        const ballImages = [];
        for (let i = 0; i < 10; i++) {
            const image = new Image();
            image.src = `../assets/planets/planet0${i}.png`;

            ballImages.push(image);
        }
        return ballImages;
    }

    // Game start transition
    _startGame(displayGameBoard = false) {
        if (!displayGameBoard) {
            this.elements.introScreen.classList.add("fade-out");
        } else {
            this.elements.introScreen.classList.add("hide");
            this.elements.gameBoard.classList.add("fade-in");
        }
    }

    // Place robot character on the bottom and center of the screen
    _placeCharacter(gameBoardElement, characterElement) {
        const xInitPosition = (gameBoardElement.clientWidth / 2) - (characterElement.clientWidth / 2);
        const yInitPosition = gameBoardElement.clientHeight - characterElement.clientHeight;

        this.elements.character.style.left = `${xInitPosition}px`;
        this.elements.character.style.top = `${yInitPosition}px`;
        this.robotObject.xPosition = xInitPosition;
    }

    // Dynamically create ball elements
    _createBallElement(planet, ballWidth, ballHeight, xPosition, yPosition) {
        const ball = document.createElement("div");
        ball.classList.add("planet-container");
        const ballIcon = document.createElement("img");

        ballIcon.src = planet.src;
        ballIcon.style.width = `${ballWidth}px`;
        ballIcon.style.height = `${ballHeight}px`;
        ball.appendChild(ballIcon);

        ball.style.left = `${xPosition}px`;
        ball.style.top = `${yPosition}px`;

        this.elements.gameBoard.appendChild(ball);

        return ball;
    }

    // Dynamically create laser element
    _createLaserElement() {
        const laser = document.createElement("div");
        laser.classList.add("laser");
        laser.style.height = "0px";  // Laser's initial height
        laser.style.width = "8px"  // Laser's width
        
        const xLaserPosition = this.robotObject.xPosition + this.robotObject.width/2 - parseInt(laser.style.width)/2;  // Center laser on robot
        const yLaserPosition = this.boardHeight - this.robotObject.height/2; // Place laser starting from the middle of character
        
        laser.style.left = `${xLaserPosition}px`;
        laser.style.top = `${yLaserPosition}px`;

        this.elements.gameBoard.appendChild(laser);

        return laser;
    }

    // Check ball collision
    _checkCollision(ball, objectType) {
        const ballRect = ball.ballElement.getBoundingClientRect();

        let collisionElementRect;
        if (objectType === "laser") {
            collisionElementRect = this.laserObject.laserElement.getBoundingClientRect();
        } else if (objectType === "character") {
            collisionElementRect = this.robotObject.characterElement.getBoundingClientRect();
        }

        // Collision conditions
        if (
            ballRect.right >= collisionElementRect.left &&
            ballRect.left <= collisionElementRect.right &&
            ballRect.top <= collisionElementRect.bottom &&
            ballRect.bottom >= collisionElementRect.top
        ) {
            return true;
        } else {
            return false;
        }
    }

    // Ball to character collision logic helper function
    _ballCharacterCollision(ballObject) {
        const collision = this._checkCollision(ballObject, "character");
        if (collision) {
            ballObject.delete();
        }
    }

    // Ball to laser collision logic helper function
    _ballLaserCollision(ballObject, ballSrc, robotObject, laserObject) {
        if (robotObject.isLaserActive) {
            const ballLaserCollision = this._checkCollision(ballObject, "laser")
            if (ballLaserCollision) {
                // ballObject.delete();
                this._splitBalls(ballObject, ballSrc);
                robotObject.isLaserActive = false;
                laserObject.delete();
            }
        }
    }
    
    /*
        This method controls the splitting behaviour of the balls once collision with laser is detected.
        When a collision is detected, the current ball is deleted and split into 2 smaller balls.
        The decrease in ball size is determined by the ball sizes in the ballSizes array.
     */
    _splitBalls(ball, ballSrc) {
        const currentBallID = ball.id;
        // If smallest ball, delete it
        if (currentBallID === 1) {
            ball.delete();
            this.ballsKilled++;
            return;
        }

        const currentBallWidth = ball.width;
        const currentBallHeight = ball.height;
        const currentBallxPosition = ball.xPosition;
        const currentBallyPosition = ball.yPosition;

        const splitBallID = ball.id - 1;
        const splitBallxPosition = currentBallxPosition + currentBallWidth/2;
        const splitBallyPosition = currentBallyPosition + currentBallHeight/2;
        const splitBallProperties = ballSizes[`ball${splitBallID}`];

        ball.delete();

        // Create 2 balls, 1 which splits left, 1 which splits right
        for (let i = 0; i < 2; i++) {
            // Create ball element
            const ballElement = this._createBallElement(
                ballSrc, 
                splitBallProperties.width,
                splitBallProperties.height,
                splitBallxPosition,
                splitBallyPosition
            );
            
            const yVelocity = -4;
            let xVelocity = -1;
            if (i === 1) xVelocity = 1;  // The second ball splits in the right direction
            
            // Create ball object
            const ballObject = new Ball(
                ballElement,
                splitBallID,
                xVelocity,
                yVelocity,
                splitBallProperties.bounceHeight,
                this.gameBoard,
            )

            ballObject.bounce();
            
            // Set ball callback functions which detects ball collision
            ballObject.onPositionChangeCallback = () => {
                this._ballCharacterCollision(ballObject, ballSrc);
                this._ballLaserCollision(ballObject, ballSrc, this.robotObject, this.laserObject);
            }

        }
    }


    // Level method
    playLevel(level) {

        // Collect balls src and array from levels array
        const { 
            ballSrc, 
            balls,
        } = this.levels[level];

        // Create new robot instance
        this.robotObject = new Robot(this.elements.character, this.elements.characterIcon, this.elements.gameBoard);
        this._placeCharacter(this.elements.gameBoard, this.elements.character);
        this._setUpEventListeners();

        for (let ball of balls) {
            // Create ball DOM element
            const ballElem = this._createBallElement(ballSrc, ball.ballSize.width, ball.ballSize.height, ball.xPosition, ball.yPosition);
            // Create new ball object and make it bounce >:^)
            let ballObject = new Ball(ballElem, ball.id, ball.xVelocity, ball.yVelocity, ball.ballSize.bounceHeight, this.elements.gameBoard);
            ballObject.bounce();
            
            // Ball position tracking code from chatGPT. 
            // set collision callback functions
            ballObject.onPositionChangeCallback = () => {
                this._ballCharacterCollision(ballObject, ballSrc);
                this._ballLaserCollision(ballObject, ballSrc, this.robotObject, this.laserObject);
            }
        }
    }


    _devmode() {
        console.log("Dev Mode")
        this.elements.introScreen.classList.add("hide");
        this.elements.gameBoard.style.opacity = 100;
        this.elements.gameBoard.style.transition = null;
    }

    
}

const game = new GameController(true);
// const game = new GameController(false);
