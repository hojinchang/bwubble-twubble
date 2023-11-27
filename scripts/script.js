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

        this.robotObject;
        this.laserObject;
        this.gameBoard = this.elements.gameBoard;

        this.levelWin = false;
        this.ballsKilled = 0;
        this.ballsRequired;

        this.currentLevel = 0;
        this.levels = [
            {   
                ballSrc: this.ballImages[0],
                ballsRequired: this._determineBallsRequired(3),
                balls: [
                    {
                        ballSize: ballSizes.ball3,
                        id: 3,
                        xPosition: 500,
                        yPosition: 200,
                        xVelocity: 150,
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
                        xVelocity: 150,
                        yVelocity: 0,
                    },
                ],
            }
        ];

        // this.playLevel(this.currentLevel);
        // this.playLevel(1);

        this._setUpGameIntro();
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
        this.elements.countdownText = document.querySelectorAll(".countdown-container div");
        this.elements.character = document.querySelector(".character-container");
        this.elements.characterIcon = document.querySelector(".character-icon");

        this.elements.modalCloseBtn = document.querySelectorAll(".modal-close-button");
        this.elements.modalBackdrop = document.createElement("div");
        this.elements.modalBackdrop.classList.add("modal-backdrop");
    }

    _setUpGameIntro() {
        // Help function with sets the modal and backdrop to show
        const _openModal = (modalType, modal, modalBackdrop, gameContainer) => {
            (modalType === "instructions") ? modal.style.display = "grid": modal.style.display = "flex"
            modalBackdrop.style.display = "block";
            gameContainer.insertBefore(modalBackdrop, this.elements.gameBoard);
        }

        const _closeModal = (e, modalBackdrop, gameContainer) => {
            const modal = e.target.closest(".modal");
            modal.style.display = "none";
            modalBackdrop.style.display = "none";
            gameContainer.removeChild(modalBackdrop);
        }


        this.elements.startGameBtn.addEventListener("click", () => {this._startGame()});
        this.elements.introScreen.addEventListener("transitionend", (e) => {
            // Stop trigger on my button scale transform transition end
            if (e.propertyName === "transform") return;
            
            this._startGame(true);
        });

        // Show instructions modal
        this.elements.instructionsBtn.addEventListener("click", () => {
            _openModal("instructions", this.elements.instructionsModal, this.elements.modalBackdrop, this.elements.gameContainer);
        });

        // Show credits modal
        this.elements.creditsBtn.addEventListener("click", () => {
            _openModal("credits", this.elements.creditsModal, this.elements.modalBackdrop, this.elements.gameContainer);
        });

        // Close modal
        this.elements.modalCloseBtn.forEach(closeBtn => {
            closeBtn.addEventListener("click", (e) => {
                _closeModal(e, this.elements.modalBackdrop, this.elements.gameContainer)
            })
        });
    }

    // Game start transition
    _startGame(displayGameBoard = false) {
        if (!displayGameBoard) {
            this.elements.introScreen.classList.add("fade-out");
        } else {
            this.elements.introScreen.classList.add("hide");
            this.elements.gameBoard.classList.add("fade-in");
            this.playLevel(this.currentLevel);
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
        // Robot arrow key controls pt.1
        document.addEventListener("keydown", (e) => {
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
        })

        // Robot arrow key controls pt.2
        document.addEventListener("keyup", (e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                this.robotObject.stopRunning();
                this.robotObject.direction = null;
            }
        })
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
            this.robotObject.lives--;
        }
    }

    // Ball to laser collision logic helper function
    _ballLaserCollision(ballObject, ballSrc, robotObject, laserObject) {
        if (robotObject.isLaserActive) {
            const ballLaserCollision = this._checkCollision(ballObject, "laser")
            if (ballLaserCollision) {
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
            this.ballsKilled++;  // Update number of balls killed
    
            const currentBallID = ball.id;
            if (currentBallID === 1) {   // If smallest ball, delete it
                ball.delete();
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
                
                const yVelocity = -550;
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
            }

            // Delete parent ball after being split in 2
            ball.delete();
        }

    _checkLevelWin(ballsKilled, ballsRequired) {
        if (ballsKilled === ballsRequired) {
            this.levelWin = true;
            console.log("WINNER WINNER CHICKEN DINNER")
        }
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
            this._ballCharacterCollision(ballObject, ballSrc);
            this._ballLaserCollision(ballObject, ballSrc, this.robotObject, this.laserObject);
            this._checkLevelWin(this.ballsKilled, this.ballsRequired);
        }
   }

    _countdown(i) {
        let delay;
        (i === 0) ? delay=0 : delay=1000;
        if (i < this.elements.countdownText.length+1) {
            setTimeout(() => {
                if (i !== 0) {
                    this.elements.countdownText[i - 1].classList.remove("activate");
                    this.elements.countdownText[i - 1].classList.add("deactivate");
                }

                if (i === this.elements.countdownText.length) {
                    return
                }
               
                this.elements.countdownText[i].classList.add("activate");
                this._countdown(i + 1);
            }, delay);
        }
    }

    // Initialize the level by creating and placing the robot, and create balls
    _initLevel(ballSrc, balls) {
        // Create new robot instance
        this.robotObject = new Robot(this.elements.character, this.elements.characterIcon, this.elements.gameBoard);
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

    // Level method
    playLevel(level) {
        // Collect balls src and array from levels array
        const { 
            ballSrc,
            ballsRequired,
            balls,
        } = this.levels[level];

        this.ballsRequired = ballsRequired;
        const ballObjects = this._initLevel(ballSrc, balls);  // initialize level

        this._countdown(0);

        setTimeout(() => {
            this._setUpRobotEventListeners();
            for (let ballObject of ballObjects) {
                this._activateBall(ballObject);
            }
        }, 5000);
    }


    _devmode() {
        console.log("Dev Mode")
        this.elements.introScreen.classList.add("hide");
        this.elements.gameBoard.style.opacity = 100;
        this.elements.gameBoard.style.transition = null;
        this.playLevel(this.currentLevel);
    }

    
}

const game = new GameController(true);
// const game = new GameController();

/* ********************************************
                Game Controller
*********************************************** */
