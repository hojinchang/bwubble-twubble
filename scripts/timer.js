"use-strict";

/* ********************************************
                    Timer
*********************************************** */
class Timer {
    constructor(
        timerElement
    ) {
        this.timerElement = timerElement;
        this.maxWidth = this.timerElement.clientWidth
        this.width = this.maxWidth;
        this.stopped = false;
        this.animationFrame;
        this._onTimerEnd = null;  // This callback function is triggered once the timer runs out. The callback function is used to reset the game once the timer runs out
        this._onTimerAddPoints = null;  // This callback function is triggered once level is won. The callback function is used to convert the remaining time into points.
        this._onTimerAddPointsEnd = null;   // This callback function is triggered once all of the time is converted into points.
    }

    // Starts the timer animation
    start(lastFrameTime) {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;
        const step = 10*deltaTime;

        this.width -= step;
        this.timerElement.style.width = `${this.width}px`;

        if (this.stopped) return;
        if (this.width <= 0) {
            if (this._onTimerEnd) {
                this.timerElement.style.display = "none";  // For some reason, the red from the timer still shows when this.width <= 0, so hide it when time runs out
                this._onTimerEnd();
            }

            return;
        }

        this.animationFrame = requestAnimationFrame(() => {this.start(lastFrameTime)});
    }

    /*
        The reason I am using setInterval rather than than animation frame is due to monitor refresh rates.
        Using animation frames, the "speed" or step of the time / ball / character could be scaled to different refresh rates by multipling the step by the delta time term.
        In the addTimerPoints() method, I am trying to convert the remaining time on the timer into points by using the _onTimerAddPoints() callback function.
        This callback function simply adds 10 points to the current score at every function call.
        Using delta time in animation frames will scale the speed of the timer / ball / character animations at 
        different refresh rates, but the functions are still called at the same frequency as the monitor.
        For example, animation frames on a 60hz monitor results in the addTimerPoints() method being called every
        1/60hz = 0.017 seconds. Animation frames on a 120hz monitor results in the method being called every
        1/120hz = 0.0083 seconds. Thus, on a 120hz monitor, the method is called twice as much, resulting in more points being added to the total.
        Using setIntervals ensures the method is called independent of the framerate.
    */
    // Convert remaining time into points
    addTimerPoints() {
        const step = 3;

        this.timerInterval = setInterval(() => {
            this.width -= step;
            this.timerElement.style.width = `${this.width}px`;
    
            if (this._onTimerAddPoints) this._onTimerAddPoints();
        
            if (this.width <= 0) {
                this.timerElement.style.display = "none";
                this.stop();
    
                if (this._onTimerAddPointsEnd) this._onTimerAddPointsEnd();
                
                clearInterval(this.timerInterval);
            }   
        }, 1);
    }

    // Stop the timer
    stop() {
        this.animationFrame = null;
        this.stopped = true;

        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    // Reset the timer
    reset() {
        this.timerElement.style.display = "block";   // Show the red timer
        this.timerElement.style.width = "100%";   // Reset the timer width to be as long as its container
        this.width = this.timerElement.clientWidth;   // Reset width property
        this.stopped = false;
    }
} 

/* ********************************************
                    Timer
*********************************************** */