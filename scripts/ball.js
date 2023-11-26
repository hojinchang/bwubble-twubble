/* ********************************************
                    Ball 
*********************************************** */
const gravity = 1000;  // Gravity constant
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
        this.bounce = this.bounce.bind(this);  // bind 'this' instance to be the ball object, 'this' loses pointer to ball object during animation frame
    }

    // Ball position tracking code from chatGPT. 
    // set up a callback function to track the x/y position of the ball in the GameController class
    set onPositionChangeCallback(callbackFunction) {
        this._onPositionChange = callbackFunction;
    }

    bounce(lastFrameTime) {
        if (this.isDeleted) return;

        const currentTime = performance.now();   // Get current timestamp
        const deltaTime = (currentTime - lastFrameTime) / 1000;   // Convert to seconds
        lastFrameTime = currentTime;
    

        // // Ball Drop
        // this.yVelocity += gravity;  // a = dy/dt  =>  dy = a*dt  =>  dy_f - dy_i = a*dt  =>  dy_f = a*dt + dy_i  =>  where dt = each animation frame
        // this.yPosition += this.yVelocity;  // v = dx/dt  =>  dx = v*dt  =>  dx_f - dx_i = v*dt  =>  dx_f = v*dt + dx_i  =>  where dt = each animation frame
        // this.xPosition += this.xVelocity;

        // Apply physics using deltaTime
        this.yVelocity += gravity * deltaTime;
        this.yPosition += this.yVelocity * deltaTime;
        this.xPosition += this.xVelocity * deltaTime;
        
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
        
        this.bounceAnimationFrame = requestAnimationFrame(() => this.bounce(lastFrameTime));
    }

    delete() {
        this.isDeleted = true;
        cancelAnimationFrame(this.bounceAnimationFrame);
        this.bounceAnimationFrame = null;
        this._onPositionChange = null;  // Stop callback function
        this.ballElement.remove();  // Remove ball element from DOM
    }
}

// Object containing the sizes and bounce heights of the different balls
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
        width: 130,
        height: 130,
        bounceHeight: 350,
        id: 5,
    }
}
/* ********************************************
                    Ball 
*********************************************** */