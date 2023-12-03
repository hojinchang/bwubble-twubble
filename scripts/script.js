"use-strict";

/* ********************************************
                Game Controller
*********************************************** */
class GameController {
    constructor(devmode = false) {
        this.devmode = devmode;

        this.elements = {};
        this._getElements();

        this.ballImages = this._getBallImages();

        // Create new robot instance
        this.robotObject;
        this.laserObject;
        this.activeBallObjects = [];
        this.gameBoard = this.elements.gameBoard;
        // this.timerObject = new Timer(this.elements.timer);   // Create new timer object
        this.keyDownHandler;
        this.keyUpHandler;

        this.previousScore = 0;
        this.currentScore = 0;
        this.levelWin = false;
        this.died = false;
        this.ballsKilled = 0;
        this.ballsRequired;

        this.currentLevel = 0;
        this.levels = [
            // {   
            //     level: 1,
            //     ballSrc: this.ballImages[0],
            //     ballsRequired: this._determineBallsRequired(3),
            //     balls: [
            //         {
            //             ballSize: ballSizes.ball3,
            //             id: 3,
            //             xPosition: 450,
            //             yPosition: 200,
            //             xVelocity: 150,
            //             yVelocity: 0,
            //         },
            //     ],
            // },
            {   
                level: 1,
                ballSrc: this.ballImages[0],
                ballsRequired: this._determineBallsRequired(1),
                balls: [
                    {
                        ballSize: ballSizes.ball1,
                        id: 1,
                        xPosition: 450,
                        yPosition: 200,
                        xVelocity: 150,
                        yVelocity: 0,
                    },
                ],
            },
            {
                level: 2,
                ballSrc: this.ballImages[1],
                ballsRequired: 
                    this._determineBallsRequired(3) 
                    + this._determineBallsRequired(2),
                balls: [
                    {
                        ballSize: ballSizes.ball3,
                        id: 3,
                        xPosition: 200,
                        yPosition: 200,
                        xVelocity: 150,
                        yVelocity: 0,
                    },
                    {
                        ballSize: ballSizes.ball2,
                        id: 2,
                        xPosition: 800,
                        yPosition: 200,
                        xVelocity: -150,
                        yVelocity: 0,
                    },
                ],
            }
        ];

        this._setUpGame();
        if (this.devmode) this._devmode();
    }

    // Collect the required DOM elements
    _getElements() {
        this.elements.gameContainer = document.querySelector(".game-container");
        this.elements.introScreen = document.querySelector(".intro-screen");
        this.elements.startGameBtn = document.querySelector(".start-game-btn");

        this.elements.instructionsBtn = document.querySelector(".instructions-btn");
        this.elements.instructionsModal = document.querySelector(".instructions-modal");

        this.elements.creditsBtn = document.querySelector(".credits-btn");
        this.elements.creditsModal = document.querySelector(".credits-modal")

        this.elements.gameBoard = document.querySelector(".game-board");
        this.elements.countdownContainer = document.querySelector(".countdown-container");
        this.elements.countdownText = document.querySelectorAll(".countdown-container div");
        this.elements.loseReasonContainer = document.querySelector(".lose-reason-container");

        this.elements.levelWinModal = document.querySelector(".level-win-modal");
        this.elements.currentLevelSpan = document.querySelector(".current-level");
        this.elements.nextLevelBtn = document.querySelector(".next-level-btn");
        this.elements.returnMainBtn = document.querySelectorAll(".return-menu-btn");

        this.elements.character = document.querySelector(".character-container");
        this.elements.characterHitbox = document.querySelector(".character-hitbox");
        this.elements.characterIcon = document.querySelector(".character-icon");
        this.elements.gameLoseModal = document.querySelector(".game-lose-modal");

        this.elements.scoreBoard = document.querySelector(".score-board");
        this.elements.levelText = document.querySelector(".level-text");
        this.elements.lifeHearts = document.querySelectorAll(".heart-icon");
        this.elements.scoreText = document.querySelector(".score-text");
        this.elements.timer = document.querySelector(".timer");

        this.elements.modalCloseBtn = document.querySelectorAll(".modal-close-button");
        this.elements.introModalBackdrop = document.createElement("div");
        this.elements.introModalBackdrop.classList.add("modal-backdrop", "intro-modal-backdrop");
        this.elements.inGameModalBackdrop = document.createElement("div");
        this.elements.inGameModalBackdrop.classList.add("modal-backdrop", "level-win-modal-backdrop");
    }

    _setUpGame() {
        // Helper function which sets the modal and backdrop to show
        const _openIntroModal = (modalType, modal, modalBackdrop, gameContainer) => {
            (modalType === "instructions") ? modal.style.display = "grid": modal.style.display = "flex"
            modalBackdrop.style.display = "block";
            gameContainer.insertBefore(modalBackdrop, this.elements.gameBoard);
        }

        // Helper function which closes the modal and backdrop
        const _closeIntroModal = (e, modalBackdrop, gameContainer) => {
            const modal = e.target.closest(".modal");
            modal.style.display = "none";
            modalBackdrop.style.display = "none";
            gameContainer.removeChild(modalBackdrop);
        }

        // Start game
        this.elements.startGameBtn.addEventListener("click", () => {this._startGame()});

        // Show instructions modal
        this.elements.instructionsBtn.addEventListener("click", () => {
            _openIntroModal("instructions", this.elements.instructionsModal, this.elements.introModalBackdrop, this.elements.gameContainer);
        });

        // Show credits modal
        this.elements.creditsBtn.addEventListener("click", () => {
            _openIntroModal("credits", this.elements.creditsModal, this.elements.introModalBackdrop, this.elements.gameContainer);
        });

        // Close modal
        this.elements.modalCloseBtn.forEach(closeBtn => {
            closeBtn.addEventListener("click", (e) => {
                _closeIntroModal(e, this.elements.introModalBackdrop, this.elements.gameContainer)
            })
        });

        // Next level button for level win modal
        this.elements.nextLevelBtn.addEventListener("click", () => {
            this.currentLevel++;
            this._closeInGameModal(this.elements.levelWinModal);
            this._resetLevel();
            this.playLevel(this.currentLevel);
        });

        // Return to menu button for level win modal
        this.elements.returnMainBtn.forEach(btn => {
            btn.addEventListener("click", () => {this._returnToMain()});
        });
    }

    // Game start transition
    _startGame() {
        this.elements.introScreen.classList.add("fade-out");
        this.elements.gameBoard.classList.add("fade-in");
        this.elements.scoreBoard.classList.add("fade-in");
        
        // Create new robot instance
        this.robotObject = new Robot(this.elements.character, this.elements.characterIcon, this.elements.gameBoard);
        this.timerObject = new Timer(this.elements.timer);   // Create new timer object
        this.timerObject._onTimerEnd = () => {this._levelLose("time")};
        this.timerObject._onTimerAddPoints = () => {this._addTimerPoints()};
        // this.timerObject._onTimerAddPointsEnd = () => {this._displayInGameModal(this.elements.levelWinModal);}
        this.playLevel(this.currentLevel);
    }

    _returnToMain() {
        // Reverse the animations from _startGame()
        this.elements.introScreen.classList.remove("fade-out");
        this.elements.gameBoard.classList.remove("fade-in");
        this.elements.scoreBoard.classList.remove("fade-in");
        
        (this.died) 
            ? this._closeInGameModal(this.elements.gameLoseModal)
            : this._closeInGameModal(this.elements.levelWinModal);

        // debugger;
        this._resetGame();
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

    /*
        This function calculates the required number of balls to be destroyed to complete a level.
        Each ballSize > 1 can split in 2, thus doubling the number of balls to be destroyed. 
    */
    _determineBallsRequired(ballID) {
        let ballsRequired = 0;
        for (let i = ballID; i > 0; i--) {
            ballsRequired += Math.pow(2, i-1);
        }

        return ballsRequired;
    }   

    // Place robot character on the bottom and center of the screen
    _placeCharacter(gameBoardElement, characterElement) {
        const xInitPosition = (gameBoardElement.clientWidth / 2) - (characterElement.clientWidth / 2);
        const yInitPosition = gameBoardElement.clientHeight - characterElement.clientHeight;

        this.elements.character.style.left = `${xInitPosition}px`;
        this.elements.character.style.top = `${yInitPosition}px`;
        this.robotObject.xPosition = xInitPosition;
    }

    // Set up event listeners
    _setUpRobotEventListeners() {
        // Keydown function, robot running and shooting
        this.keyDownHandler = (e) => {
            let lastFrameTime = performance.now();
            if (e.key === "ArrowRight") {
                this.robotObject.run("right", lastFrameTime);
            } else if (e.key === "ArrowLeft") {
                this.robotObject.run("left", lastFrameTime);
            } else if (e.key === " " && !this.robotObject.isLaserActive) {   // shoot
                const laserElement = this._createLaserElement();
                this.laserObject = new Laser(laserElement);
                this.robotObject.shoot(this.laserObject, lastFrameTime);
            }
        }

        // Keyup function, stop robot from running
        this.keyUpHandler = (e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                this.robotObject.stopRunning();
                this.robotObject.direction = null;
            }
        }

        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
    }

    // Remove event listeners to stop robot control once level win
    _removeRobotEventListeners() {
        document.removeEventListener("keydown", this.keyDownHandler);
        document.removeEventListener("keyup", this.keyUpHandler);
        this.robotObject.stopRunning();
    }

    // Dynamically create ball elements
    _createBallElement(ballImage, ballWidth, ballHeight, xPosition, yPosition) {
        const ball = document.createElement("div");
        ball.classList.add("planet-container");
        const ballIcon = document.createElement("img");

        ballIcon.src = ballImage.src;
        ballIcon.setAttribute("alt", "Ball");
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

    // Update and reset the game when level is lost
    _levelLose(loseReason) {
        // Different lose message depending on the lose condition
        let loseMessage;
        (loseReason === "collision")
            ? loseMessage = "You got crushed by my planet!"
            : loseMessage = "You're too slow, timer ran out!"

        this.elements.loseReasonContainer.classList.add("fade-in");
        this.elements.loseReasonContainer.innerText = loseMessage;

        // Level updates
        this.robotObject.lives--;
        this._updateLifeHearts();
        this.timerObject.stop();
        this._checkGameState();
    }

    // Check ball collision
    _checkCollision(ball, objectType) {
        const ballRect = ball.ballElement.getBoundingClientRect();

        let collisionElementRect;
        if (objectType === "laser") {
            collisionElementRect = this.laserObject.laserElement.getBoundingClientRect();
        } else if (objectType === "character") {
            collisionElementRect = this.elements.characterHitbox.getBoundingClientRect();
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
        if (collision) this._levelLose("collision");

        return collision
    }

    // Ball to laser collision logic helper function
    _ballLaserCollision(ballObject, ballSrc, robotObject, laserObject) {
        if (robotObject.isLaserActive) {
            const ballLaserCollision = this._checkCollision(ballObject, "laser")
            if (ballLaserCollision) {
                this._splitBalls(ballObject, ballSrc);   // Split the ball into 2
                robotObject.isLaserActive = false;   // Reset
                laserObject.delete();   // Delete laser 
                this.laserObject = null;   // Delete laser 

                // Update score
                this.currentScore += 100;
                this.elements.scoreText.innerText = this.currentScore;
            }
        }
    }

    /* 
        Pause the game when a ball to character collision is detected
        Pause so the player can see the collision rather than immediately resetting the game
    */
    _collisionPause() {
        this._removeRobotEventListeners();
        this.robotObject.stopLaser();

        // Stop bounce animation of every ball
        for (let ballObject of this.activeBallObjects) {
            ballObject.stopBounce();
        }
    }

    /*
        Method which checks the game state
        If the player has > 1 lives, restart the level
        If the player has <= 0 lives, player loses, show game lose modal 
    */
    _checkGameState() {
        const timoutDelay = 2000;

        if (this.robotObject.lives <= 0) {   // Player lost all 3 lives
            this.died = true;
            this._collisionPause();

            // Pause the game for 2 seconds before resetting it
            setTimeout(() => {
                this._displayInGameModal(this.elements.gameLoseModal);   // Show game lose modal
            }, timoutDelay);

        } else {   // Player lose 1 out of 3 lives
            this._collisionPause();

            // Pause the game for 2 seconds before resetting it
            setTimeout(() => {
                this._resetLevel();
                this.currentScore = this.previousScore;
                this.playLevel(this.currentLevel);
            }, timoutDelay);
        }
    }

    // Remove ball from the game
    _removeBallFromGame(ball) {
        // Remove ball from activeBallObjects array
        const idx = this.activeBallObjects.indexOf(ball);   
        this.activeBallObjects.splice(idx, 1);
        // Delete ball
        ball.delete();
    }

    /*
        This method controls the splitting behaviour of the balls once collision with laser is detected.
        When a collision is detected, the current ball is deleted and split into 2 smaller balls.
        The decrease in ball size is determined by the ball sizes in the ballSizes array.
     */
    _splitBalls(ball, ballSrc) {
        this.ballsKilled++;  // Update number of balls killed

        const currentBallID = ball.id;
        if (currentBallID === 1) {   // If smallest ball, delete it
            this._removeBallFromGame(ball);
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
            
            const yVelocity = -550;  // Launch balls upwards
            let xVelocity = -150;
            if (i === 1) xVelocity = 150;  // Ensure the balls split in opposite directions
            
            // Create ball object
            const ballObject = new Ball(
                ballElement,
                splitBallID,
                xVelocity,
                yVelocity,
                splitBallProperties.bounceHeight,
                this.gameBoard,
            )

            this._activateBall(ballObject);
            this.activeBallObjects.push(ballObject)
        }

        // Delete parent ball after being split in 2
        this._removeBallFromGame(ball);
    }

    // Show level win modal
    _displayInGameModal(modal) {
        modal.style.display = "block"
        modal.style.opacity = 1;
        this.elements.inGameModalBackdrop.style.display = "block";
        this.elements.gameContainer.insertBefore(this.elements.inGameModalBackdrop, this.elements.gameBoard);
    }

    // Close level win modal
    _closeInGameModal(modal) {
        modal.style.display = "none"
        modal.style.opacity = 0;
        this.elements.inGameModalBackdrop.style.display = "none";
        this.elements.gameContainer.removeChild(this.elements.inGameModalBackdrop);
    }

    // Callback function which checks if level is won
    _checkLevelWin(ballsKilled, ballsRequired, lives) {
        if (ballsKilled === ballsRequired && lives > 0) {
            this.levelWin = true;
            this._removeRobotEventListeners();

            this.timerObject.stop();
            let lastFrameTime = performance.now();
            this.timerObject.width = 500;
            this.timerObject.addTimerPoints(lastFrameTime);
            this.timerObject._onTimerAddPointsEnd = () => {this._displayInGameModal(this.elements.levelWinModal);}
        }
    }

    _addTimerPoints() {
        this.currentScore += 10;
        this.elements.scoreText.innerText = this.currentScore;
    }

    // Activate ball movement and set collision detection callback functions
   _activateBall(ballObject) {
        let ballSrc = ballObject.ballElement.querySelector("img");
        // Make ball bounce >:^)
        let lastFrameTime = performance.now();
        ballObject.bounce(lastFrameTime);
        
        // The idea to use callback functions to detect collisions is from ChatGPT
        // Set ball callback functions which detects ball collision
        ballObject.onPositionChangeCallback = () => {
            const characterCollision = this._ballCharacterCollision(ballObject, ballSrc);
            if (!characterCollision) {
                this._ballLaserCollision(ballObject, ballSrc, this.robotObject, this.laserObject);
                this._checkLevelWin(this.ballsKilled, this.ballsRequired, this.robotObject.lives);
            }
        }
   }

   // Level countdown method
    _countdown(i) {
        let delay;
        (i === 0) ? delay = 0 : delay = 1000;
        if (i < this.elements.countdownText.length + 1) {  // Countdown from 3 to 0
            setTimeout(() => {
                if (i !== 0) {
                    this.elements.countdownText[i - 1].classList.remove("activate");   // Remove class
                    this.elements.countdownText[i - 1].classList.add("deactivate");   //  Slide number out of view
                }

                // break out of loop
                if (i === this.elements.countdownText.length) {
                    return
                }
               
                this.elements.countdownText[i].classList.add("activate");   // Slide number into view
                this._countdown(i + 1);
            }, delay);
        }
    }

    // Initialize the level by creating and placing the robot, and create balls
    _initLevel(ballSrc, balls) {
        this._placeCharacter(this.elements.gameBoard, this.elements.character);

        const ballObjects = []
        // Create initial balls once level starts
        for (let ball of balls) {
            // Create ball DOM element
            const ballElem = this._createBallElement(ballSrc, ball.ballSize.width, ball.ballSize.height, ball.xPosition, ball.yPosition);
            // Create new ball object
            const ballObject = new Ball(ballElem, ball.id, ball.xVelocity, ball.yVelocity, ball.ballSize.bounceHeight, this.elements.gameBoard);
            ballObjects.push(ballObject);
        }

        return ballObjects;
    }

    // Resets the level 
    _resetLevel() {
        this.elements.loseReasonContainer.classList.remove("fade-in");

        if (this.laserObject) {
            this.robotObject.isLaserActive = false;
            this.laserObject.delete(); // Remove the laser if it exists
            this.laserObject = null;
        }
        
        this.ballsKilled = 0;   // Reset the ball kill count
        this.levelWin = false;   // Reset level win flag
        this.timerObject.reset();   // Reset timer
        this._removeRobotEventListeners();   // Stop user from controlling the robot

        // Remove deactivate class from countdown text
        for (let countdown of this.elements.countdownText) {
            countdown.classList.remove("deactivate");
        }

        // Delete every active ball
        for (let ballObject of this.activeBallObjects) {
            ballObject.delete();
        }
        
        this.activeBallObjects = [];
    }

    _resetGame() {
        this._resetLevel();
        this.currentLevel = 0;
        this.currentScore = 0;
        this.robotObject = null;
        this.timerObject = null;
        this.died = false;

        // reset heart UI
        for (let i = 0; i < 3; i++) {
            this.elements.lifeHearts[i].src = "../assets/scoreboard/heart.png";
        }
    }

    _updateLifeHearts() {
        const lives = this.robotObject.lives;
        for (let i = 0; i < 3; i++) {
            if (i < lives) {
                this.elements.lifeHearts[i].src = "../assets/scoreboard/heart.png";
            } else {
                this.elements.lifeHearts[i].src = "../assets/scoreboard/heart-black.png";
            }
        }
    }

    // Level method
    playLevel(level) {
        // Update scoreboard
        this.previousScore = this.currentScore;
        this.elements.scoreText.innerText = this.currentScore;
        this.elements.levelText.innerText = this.currentLevel+1;


        // Collect balls src and array from levels array
        const { 
            ballSrc,
            ballsRequired,
            balls,
        } = this.levels[level];

        this.ballsRequired = ballsRequired; 
        this.activeBallObjects = this._initLevel(ballSrc, balls);

        // Display the countdown container and begin game countdown
        this.elements.countdownContainer.style.display = "flex";
        this._countdown(0);

        // Run after the countdown
        setTimeout(() => {
            let lastFrameTime = performance.now();
            this.timerObject.start(lastFrameTime);
            this.elements.countdownContainer.style.display = "none";
            this._setUpRobotEventListeners();
            for (let ballObject of this.activeBallObjects) {
                this._activateBall(ballObject);
            }
        }, 5000);
    }


    _devmode() {
        console.log("Dev Mode")
        this.elements.introScreen.classList.add("hide");
        this.elements.gameBoard.classList.add("fade-in");
        this.elements.scoreBoard.classList.add("fade-in");
        this.elements.gameBoard.style.transition = null;
        this.robotObject = new Robot(this.elements.character, this.elements.characterIcon, this.elements.gameBoard);
        this.playLevel(this.currentLevel);
    }

    
}

// const game = new GameController(true);
const game = new GameController();

/* ********************************************
                Game Controller
*********************************************** */