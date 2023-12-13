"use-strict";

/* ********************************************
                Game Controller
*********************************************** */
class GameController {
    constructor(devmode = false) {
        this.devmode = devmode;
        // Set up game and UI
        this.gameUI = new GameUI();
        this.ballImages = this.gameUI.ballImages;
        this._setUpGame();

        this.gameAudioObject = new DankBeatz();
        this.audioModeIdx = 0;

        // Initialize objects
        this.robotObject;
        this.laserObject;
        this.activeBallObjects = [];
        this.gameBoard = this.gameUI.elements.gameBoard;
        this.keyDownHandler;
        this.keyUpHandler;

        // Game stats and status
        this.gameWin = false;
        this.levelWin = false;
        this.died = false;
        this.previousScore = 0;
        this.currentScore = 0;
        this.ballsKilled = 0;
        this.previousTotalBallsKilled = 0;
        this.totalBallsKilled = 0;
        this.ballsRequired;

        this.currentLevel = 0;
        this.levels = [
            {   
                level: 1,
                ballSrc: this.ballImages[0],
                ballsRequired: this._determineBallsRequired(2),
                balls: [
                    {ballSize: ballSizes.ball2, id: 2, xPosition: 450, yPosition: 200, xVelocity: 125, yVelocity: 0},
                ],
            },
            {   
                level: 2,
                ballSrc: this.ballImages[1],
                ballsRequired: this._determineBallsRequired(3),
                balls: [
                    {ballSize: ballSizes.ball3, id: 3, xPosition: 450, yPosition: 200, xVelocity: -125, yVelocity: 0},
                ],
            },
            {   
                level: 3,
                ballSrc: this.ballImages[2],
                ballsRequired: this._determineBallsRequired(4),
                balls: [
                    {ballSize: ballSizes.ball4, id: 4, xPosition: 50, yPosition: 200, xVelocity: 125, yVelocity: 0},
                ],
            },
            {   
                level: 4,
                ballSrc: this.ballImages[3],
                ballsRequired: this._determineBallsRequired(3) * 2,
                balls: [
                    {ballSize: ballSizes.ball3, id: 3, xPosition: 200, yPosition: 300, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball3, id: 3, xPosition: 750, yPosition: 300, xVelocity: -125, yVelocity: 0},
                ],
            },
            {   
                level: 5,
                ballSrc: this.ballImages[4],
                ballsRequired: this._determineBallsRequired(1)*8,
                balls: [
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 0, yPosition: 485, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 100, yPosition: 580, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 200, yPosition: 485, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 300, yPosition: 580, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 980, yPosition: 485, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 880, yPosition: 580, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 780, yPosition: 485, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 680, yPosition: 580, xVelocity: 125, yVelocity: 0},
                ],
            },
            {   
                level: 6,
                ballSrc: this.ballImages[5],
                ballsRequired: this._determineBallsRequired(1)*12,
                balls: [
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 0, yPosition: 485, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 30, yPosition: 485, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 60, yPosition: 485, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 200, yPosition: 485, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 230, yPosition: 485, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 260, yPosition: 485, xVelocity: 125, yVelocity: 0},
                    
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 980, yPosition: 485, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 950, yPosition: 485, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 920, yPosition: 485, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 800, yPosition: 485, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 770, yPosition: 485, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball1, id: 1, xPosition: 740, yPosition: 485, xVelocity: -125, yVelocity: 0},
                ],
            },
            {   
                level: 7,
                ballSrc: this.ballImages[6],
                ballsRequired: this._determineBallsRequired(4)
                            + this._determineBallsRequired(3) * 2,
                balls: [
                    {ballSize: ballSizes.ball4, id: 4, xPosition: 455, yPosition: 200, xVelocity: 0, yVelocity: 0},
                    {ballSize: ballSizes.ball3, id: 3, xPosition: 75, yPosition: 300, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball3, id: 3, xPosition: 865, yPosition: 300, xVelocity: -125, yVelocity: 0},
                ],
            },
            {   
                level: 8,
                ballSrc: this.ballImages[7],
                ballsRequired: this._determineBallsRequired(5),
                balls: [
                    {ballSize: ballSizes.ball5, id: 5, xPosition: 600, yPosition: 100, xVelocity: -125, yVelocity: 0},
                ],
            },
            {   
                level: 9,
                ballSrc: this.ballImages[8],
                ballsRequired: this._determineBallsRequired(4)
                            + this._determineBallsRequired(3) * 2
                            + this._determineBallsRequired(2) * 2,
                balls: [
                    {ballSize: ballSizes.ball4, id: 4, xPosition: 455, yPosition: 200, xVelocity: -50, yVelocity: 0},
                    {ballSize: ballSizes.ball3, id: 3, xPosition: 75, yPosition: 300, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball3, id: 3, xPosition: 865, yPosition: 300, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball2, id: 2, xPosition: 200, yPosition: 400, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball2, id: 2, xPosition: 768, yPosition: 400, xVelocity: 125, yVelocity: 0},
                ],
            },
            {   
                level: 10,
                ballSrc: this.ballImages[9],
                ballsRequired: this._determineBallsRequired(4)
                            + this._determineBallsRequired(3) * 2
                            + this._determineBallsRequired(2) * 4,
                balls: [
                    {ballSize: ballSizes.ball4, id: 4, xPosition: 455, yPosition: 200, xVelocity: 400, yVelocity: 0},
                    {ballSize: ballSizes.ball3, id: 3, xPosition: 75, yPosition: 350, xVelocity: 125, yVelocity: 0},
                    {ballSize: ballSizes.ball3, id: 3, xPosition: 865, yPosition: 350, xVelocity: -125, yVelocity: 0},
                    {ballSize: ballSizes.ball2, id: 2, xPosition: 350, yPosition: 350, xVelocity: 375, yVelocity: -300},
                    {ballSize: ballSizes.ball2, id: 2, xPosition: 618, yPosition: 350, xVelocity: -375, yVelocity: -300},
                    {ballSize: ballSizes.ball2, id: 2, xPosition: 350, yPosition: 100, xVelocity: 275, yVelocity: -1000},
                    {ballSize: ballSizes.ball2, id: 2, xPosition: 618, yPosition: 100, xVelocity: -275, yVelocity: -1000},
                ],
            },
        ];

        if (this.devmode) this._devmode();
    }

    _setUpGame() {
        // Helper function which sets the modal and backdrop to show
        const _openIntroModal = (modalType, modal, modalBackdrop, gameContainer) => {
            (modalType === "instructions") ? modal.style.display = "grid": modal.style.display = "flex"
            modalBackdrop.style.display = "block";
            gameContainer.insertBefore(modalBackdrop, this.gameUI.elements.gameBoard);
        }

        // Helper function which closes the modal and backdrop
        const _closeIntroModal = (e, modalBackdrop, gameContainer) => {
            const modal = e.target.closest(".modal");
            modal.style.display = "none";
            modalBackdrop.style.display = "none";
            gameContainer.removeChild(modalBackdrop);
        }

        // Audio selection carousel
        this.gameUI.elements.nextTrackBtn.addEventListener("click", () => {this._nextAudio(1)});
        this.gameUI.elements.previousTrackBtn.addEventListener("click", () => {this._nextAudio(-1)});

        // Play select audio
        this.gameUI.elements.buttons.forEach(btn => {
            btn.addEventListener("click", () => {this.gameAudioObject.select()});
        });

        // Start game
        this.gameUI.elements.startGameBtn.addEventListener("click", () => {this._startGame()});

        // Show instructions modal
        this.gameUI.elements.instructionsBtn.addEventListener("click", () => {
            _openIntroModal("instructions", this.gameUI.elements.instructionsModal, this.gameUI.elements.introModalBackdrop, this.gameUI.elements.gameContainer);
        });

        // Easter egg audio
        this.gameUI.elements.instructionsEasterEgg.addEventListener("click", () => {
            this.gameAudioObject.imaFirinMahLazer();
        });

        // Show credits modal
        this.gameUI.elements.creditsBtn.addEventListener("click", () => {
            _openIntroModal("credits", this.gameUI.elements.creditsModal, this.gameUI.elements.introModalBackdrop, this.gameUI.elements.gameContainer);
        });

        // Close modal
        this.gameUI.elements.modalCloseBtn.forEach(closeBtn => {
            closeBtn.addEventListener("click", (e) => {
                this.gameAudioObject.select();   // PLay audio
                _closeIntroModal(e, this.gameUI.elements.introModalBackdrop, this.gameUI.elements.gameContainer)
            })
        });

        // Next level button for level win modal
        this.gameUI.elements.nextLevelBtn.addEventListener("click", () => {
            this.currentLevel++;
            this.gameUI._closeInGameModal(this.gameUI.elements.levelWinModal);
            this._resetLevel();
            this.playLevel(this.currentLevel);
        });

        // Return to menu button for level win modal
        this.gameUI.elements.returnMainBtn.forEach(btn => {
            btn.addEventListener("click", () => {this._returnToMain()});
        });
    }

    // Game start transition
    _startGame() {
        this.gameUI.elements.introScreen.classList.add("fade-out");
        this.gameUI.elements.gameBoard.classList.add("fade-in");
        this.gameUI.elements.scoreBoard.classList.add("fade-in");
        
        // Create new robot instance
        this.robotObject = new Robot(this.gameUI.elements.character, this.gameUI.elements.characterIcon, this.gameUI.elements.gameBoard);
        this.timerObject = new Timer(this.gameUI.elements.timer);   // Create new timer object
        this.timerObject._onTimerEnd = () => {this._levelLose("time")};   // Set up timer callback function
        this.timerObject._onTimerAddPoints = () => {this._addTimerPoints()};   // Set up timer callback function
        this.playLevel(this.currentLevel);
    }

    // Audio selection carousel 
    _nextAudio(increment) {
        this.audioModeIdx += increment;   // Keep track of the current audio idx
        
        if (this.audioModeIdx === this.gameUI.elements.audioTracks.length) this.audioModeIdx = 0;   // Go back to first option
        if (this.audioModeIdx < 0) this.audioModeIdx = this.gameUI.elements.audioTracks.length - 1;   // Go to last option
        
        this.gameUI.elements.audioTracks.forEach(track => {track.classList.remove("active")});   // Remove active class from every audio track (stop displaying)

        // Get selected audio ui element and associated audio mode
        const selectedAudioElement = this.gameUI.elements.audioTracks[this.audioModeIdx];
        const audioMode = selectedAudioElement.dataset.audioMode;

        selectedAudioElement.classList.add("active");   // Set the selected audio ui element to active (display it in carousel)

        this.gameAudioObject.audioMode = audioMode;
        if (audioMode === "chill-mode" || audioMode === "hype-mode") {
            this.gameAudioObject.select();   // Play select noise
            this.gameAudioObject.playBackgroundMusic();   // Play background music
        } else {
            this.gameAudioObject.mute();   // Mute background music
            this.gameAudioObject.audioMode = "mute";
        }
    }

    // Go back to main menu
    _returnToMain() {
        // Reverse the animations from _startGame()
        this.gameUI.elements.introScreen.classList.remove("fade-out");
        this.gameUI.elements.gameBoard.classList.remove("fade-in");
        this.gameUI.elements.scoreBoard.classList.remove("fade-in");

        if (this.died) {   // Case when user loses all 3 lives
            this.gameUI._closeInGameModal(this.gameUI.elements.gameLoseModal);
        } else if (this.gameWin) {   // Case when user wins the game
            this.gameUI._closeInGameModal(this.gameUI.elements.gameWinModal);
        } else {   // Case when user clicks back to main after winning a level
            this.gameUI._closeInGameModal(this.gameUI.elements.levelWinModal);
        }

        this._resetGame();
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
                const laserElement = this.gameUI._createLaserElement(this.robotObject);
                this.laserObject = new Laser(laserElement);
                this.gameAudioObject.laser();   // PLay laser sound
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

    // Update and reset the game when level is lost
    _levelLose(loseReason) {
        // Different lose message depending on the lose condition
        let loseMessage;
        (loseReason === "collision")
            ? loseMessage = "You got crushed by my planet!"
            : loseMessage = "You're too slow, timer ran out!"

        this.gameUI.elements.loseReasonContainer.classList.add("fade-in");
        this.gameUI.elements.loseReasonContainer.innerText = loseMessage;

        // Level updates
        this.robotObject.lives--;
        this.gameUI._updateLifeHearts(this.robotObject);
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
            collisionElementRect = this.gameUI.elements.characterHitbox.getBoundingClientRect();
        }

        // Collision conditions
        if (
            ballRect.right >= collisionElementRect.left &&
            ballRect.left <= collisionElementRect.right &&
            ballRect.top <= collisionElementRect.bottom &&
            ballRect.bottom >= collisionElementRect.top
        ) {
            this.gameAudioObject.collision();
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
                this.gameUI.elements.scoreText.innerText = this.currentScore;
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
                this.gameUI._setOutputStats(this.currentScore, this.totalBallsKilled);
                this.gameUI._displayInGameModal(this.gameUI.elements.gameLoseModal);   // Show game lose modal
            }, timoutDelay);

        } else {   // Player lose 1 out of 3 lives
            this._collisionPause();

            // Pause the game for 2 seconds before resetting it
            setTimeout(() => {
                this.currentScore = this.previousScore;
                this.totalBallsKilled = this.previousTotalBallsKilled;

                this._resetLevel();
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
        this.totalBallsKilled++;

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
            const ballElement = this.gameUI._createBallElement(
                ballSrc, 
                splitBallProperties.width,
                splitBallProperties.height,
                splitBallxPosition,
                splitBallyPosition
            );
            
            const yVelocity = -550;  // Launch balls upwards
            // let xVelocity = -150;
            // if (i === 1) xVelocity = 150;  // Ensure the balls split in opposite directions
            let xVelocity = -125;
            if (i === 1) xVelocity = 125;  // Ensure the balls split in opposite directions
            
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


    // Callback function which checks if level is won
    _checkLevelWin(ballsKilled, ballsRequired, lives) {
        // Level is won if all of the balls are destroyed and player has lives remaining
        if (ballsKilled === ballsRequired && lives > 0) {
            this.levelWin = true;
            this._removeRobotEventListeners();

            this.timerObject.stop();
            this.timerObject.addTimerPoints();
            this.gameAudioObject.timeReward();

            this.previousTotalBallsKilled = this.totalBallsKilled;
            this.previousScore = this.currentScore;

            this.timerObject._onTimerAddPointsEnd = () => {
                if (this.currentLevel === (this.levels.length - 1)) {   // Check if game win
                    this.gameWin = true;
                    this.gameUI._setOutputStats(this.currentScore, this.totalBallsKilled);
                    this.gameUI._displayInGameModal(this.gameUI.elements.gameWinModal);   // Display game win modal
                } else {   // Else, you won a lavel
                    this.gameUI._displayInGameModal(this.gameUI.elements.levelWinModal);   // Display level win modal
                }
            };
        }
    }

    _addTimerPoints() {
        this.currentScore += 5;
        this.gameUI.elements.scoreText.innerText = this.currentScore;
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

    // Initialize the level by creating and placing the robot, and create balls
    _initLevel(ballSrc, balls) {
        this.gameUI._placeCharacter(this.gameUI.elements.gameBoard, this.gameUI.elements.character, this.robotObject);

        const ballObjects = []
        // Create initial balls once level starts
        for (let ball of balls) {
            // Create ball DOM element
            const ballElem = this.gameUI._createBallElement(ballSrc, ball.ballSize.width, ball.ballSize.height, ball.xPosition, ball.yPosition);
            // Create new ball object
            const ballObject = new Ball(ballElem, ball.id, ball.xVelocity, ball.yVelocity, ball.ballSize.bounceHeight, this.gameUI.elements.gameBoard);
            ballObjects.push(ballObject);
        }

        return ballObjects;
    }

    // Resets the level 
    _resetLevel() {
        this.gameUI.elements.loseReasonContainer.classList.remove("fade-in");

        if (this.laserObject) {
            this.robotObject.isLaserActive = false;
            this.laserObject.delete(); // Remove the laser if it exists
            this.laserObject = null;
        }
        
        this.ballsKilled = 0;   // Reset the ball kill count
        this.levelWin = false;   // Reset level win flag
        this.timerObject.reset();   // Reset timer
        this._removeRobotEventListeners();   // Stop user from controlling the robot
        this.robotObject.characterElement.classList.remove("flip-character");

        // Remove deactivate class from countdown text
        for (let countdown of this.gameUI.elements.countdownText) {
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
        this.previousScore = 0;
        this.totalBallsKilled = 0;
        this.previousTotalBallsKilled = 0;
        this.robotObject = null;
        this.timerObject = null;
        this.died = false;
        this.gameWin = false;

        // reset heart UI
        for (let i = 0; i < 3; i++) {
            this.gameUI.elements.lifeHearts[i].src = "./assets/scoreboard/heart.png";
        }
    }

    // Level method
    playLevel(level) {
        // Update scoreboard
        this.previousScore = this.currentScore;
        this.previousTotalBallsKilled = this.totalBallsKilled;
        this.gameUI.elements.scoreText.innerText = this.currentScore;
        this.gameUI.elements.levelText.innerText = this.currentLevel+1;


        // Collect balls src and array from levels array
        const { 
            ballSrc,
            ballsRequired,
            balls,
        } = this.levels[level];

        console.log(ballsRequired)

        this.ballsRequired = ballsRequired; 
        this.activeBallObjects = this._initLevel(ballSrc, balls);

        // Display the countdown container and begin game countdown
        this.gameUI.elements.countdownContainer.style.display = "flex";
        this.gameUI._countdown(0);
        setTimeout(() => {
            this.gameAudioObject.countdown();

        }, 650);

        // Run after the countdown
        setTimeout(() => {
            let lastFrameTime = performance.now();
            this.timerObject.start(lastFrameTime);
            this.gameUI.elements.countdownContainer.style.display = "none";
            this._setUpRobotEventListeners();
            for (let ballObject of this.activeBallObjects) {
                this._activateBall(ballObject);
            }
        }, 5000);
    }


    _devmode() {
        console.log("Dev Mode")
        this.gameUI.elements.introScreen.classList.add("hide");
        this.gameUI.elements.gameBoard.classList.add("fade-in");
        this.gameUI.elements.scoreBoard.classList.add("fade-in");
        this.gameUI.elements.gameBoard.style.transition = null;
        this.robotObject = new Robot(this.gameUI.elements.character, this.gameUI.elements.characterIcon, this.gameUI.elements.gameBoard);
        this.playLevel(this.currentLevel);
    }

    
}

// const game = new GameController(true);
const game = new GameController();

/* ********************************************
                Game Controller
*********************************************** */