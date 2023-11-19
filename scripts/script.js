"use-strict"

const character = document.querySelector(".character-icon");
const gameBoard = document.querySelector(".game-board");


const characterWidth = character.clientWidth;
const characterHeight = character.clientHeight;
const boardWidth = gameBoard.clientWidth;
const boardHeight = gameBoard.clientHeight;


const runImages = [];
function initGame() {
    function _placeCharacter() {
        const xPosition = (boardWidth / 2) - (characterWidth / 2);
        const yPosition = boardHeight - characterHeight;

        character.style.left = `${xPosition}px`;
        character.style.top = `${yPosition}px`;
    }

    function _getRunImages() {
        for (let i = 0; i < 8; i++) {
            const image = new Image();
            image.src = `../assets/character/Run-${i+1}.png`;
            runImages.push(image);
        }
    }

    _placeCharacter();
    _getRunImages();
}



let runIdx = 0;
let isRunning = false;
let runInterval;

class Robot {
    constructor(idleImgPath, characterWidth, characterHeight) {
        this.idleState = idleImgPath;
        this.isRunning = false;
        this.runInterval;
        this.runIdx = 0;
        this.direction;

        this.width = characterWidth;
        this.height = characterHeight;

        this._runAnimation = this._runAnimation.bind(this);
    }


    /* 
        Cycle through runImages array to animate running.
        Move the character with a step of 15px when running
    */
    _runAnimation() {
        character.src = runImages[this.runIdx].src;
        
        let xPosition = parseInt(character.style.left);   // Current xPosition
        const step = 2;

        // Update the xPosition depending on if moving left or right
        (this.direction === "left") ? xPosition = xPosition - step :
                                      xPosition = xPosition + step;

        if ((xPosition + this.width) >= boardWidth) {
            xPosition = boardWidth - this.width;
        } else if (xPosition <= 0) {
            xPosition = 0;
        }

        character.style.left = `${xPosition}px`;

        // Update the run image index and reset back to 0
        this.runIdx = (this.runIdx + 1) % runImages.length;

        // Rerun the animation frame because it only runs once
        this.runInterval = requestAnimationFrame(() => this._runAnimation());
    }


    run(direction) {
        if (!this.isRunning) {
            this.isRunning = true;
            this.direction = direction;

            (this.direction === "left") ? character.classList.add("flip-character") : 
                                          character.classList.remove("flip-character");


            // this.runInterval = setInterval(() => this._runAnimation(), 100);
            this.runInterval = requestAnimationFrame(() => this._runAnimation());
        }
    }

    stopRunning() {
        // clearInterval(this.runInterval);
        cancelAnimationFrame(this.runInterval);
        this.isRunning = false;
    }
}

const idleImagePath = "../assets/character/Idle-1.png";
const robot = new Robot(idleImagePath, characterWidth, characterHeight);

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
        robot.run("right");
    } else if (e.key === "ArrowLeft") {
        robot.run("left");
    }
})

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        robot.stopRunning();
        character.src = robot.idleState;
    }
})


initGame();