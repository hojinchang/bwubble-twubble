class DankBeatz {
    constructor() {
        this.easterEggAudio = document.querySelector(".ima-firin-mah-lazer");
        this.selectAudio = document.querySelector(".select-audio");
        this.hypeCountdownAudio = document.querySelector(".hype-countdown-audio");
        this.chillCountdownAudio = document.querySelector(".chill-countdown-audio");
        this.laserAudio = document.querySelector(".laser-audio");
        this.collisionAudio = document.querySelector(".collision-audio");
        this.timeRewardAudio = document.querySelector(".time-reward-audio");
    }

    imaFirinMahLazer() {
        this.easterEggAudio.currentTime = 0;
        this.easterEggAudio.volume = 0.8;
        this.easterEggAudio.play();
    }

    select() {
        this.selectAudio.currentTime = 0;
        this.selectAudio.volume = 0.5;
        this.selectAudio.play();
    }

    countdown() {
        this.hypeCountdownAudio.currentTime = 0;
        this.hypeCountdownAudio.volume = 0.6;
        this.hypeCountdownAudio.play();
    }

    laser() {
        this.laserAudio.currentTime = 0;
        this.countdownAudio.volume = 0.5;
        this.laserAudio.play();
    }

    collision() {
        this.collisionAudio.currentTime = 0;
        this.collisionAudio.volume = 0.4;
        this.collisionAudio.play();
    }

    timeReward() {
        this.timeRewardAudio.currentTime = 0;
        this.timeRewardAudio.volume = 0.2;
        this.timeRewardAudio.play();
    }
}