"use-strict";

class Timer {
    constructor(
        timerElement
    ) {
        this.timerElement = timerElement;
        this.width = this.timerElement.clientWidth;
        this.stopped = false;
        this.animationFrame;
    }

    start(lastFrameTime) {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;

        const step = 17*deltaTime;

        this.width -= step;
        this.timerElement.style.width = `${this.width}px`;

        if (this.stopped) return;
        if (this.width <= 0) {
            this.stop();
        }

        this.animationFrame = requestAnimationFrame(() => {this.start(lastFrameTime)});

    }

    stop() {
        this.animationFrame = null;
        this.stopped = true;
    }

    reset() {
        this.timerElement.style.width = "100%";
        this.stopped = false;
    }

} 