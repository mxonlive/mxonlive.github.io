// nexplayer.js

class NexPlayer {
    constructor(config) {
        this.selector = config.selector;
        this.source = config.source;
        this.container = document.querySelector(this.selector);
        this.video = null;
        this.hls = null;

        
        this.init();
    }

    init() {
        
        this.container.classList.add('nex-container');

        
        this.container.innerHTML = `
            <video class="nex-video"></video>
            <div class="nex-controls">
                <button class="nex-btn nex-play-btn">▶</button>
                <input type="range" class="nex-volume-slider" min="0" max="1" step="0.1" value="1">
                <div class="nex-live-badge"><div class="nex-live-dot"></div> LIVE</div>
                <button class="nex-btn nex-fs-btn">⛶</button>
            </div>
        `;

        
        this.video = this.container.querySelector('.nex-video');
        this.playBtn = this.container.querySelector('.nex-play-btn');
        this.volumeSlider = this.container.querySelector('.nex-volume-slider');
        this.fsBtn = this.container.querySelector('.nex-fs-btn');

        
        this.loadStream();
        this.addEventListeners();
    }

    loadStream() {
        if (Hls.isSupported() && this.source.endsWith('.m3u8')) {
            this.hls = new Hls();
            this.hls.loadSource(this.source);
            this.hls.attachMedia(this.video);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("NexPlayer: Stream loaded");
            });
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            this.video.src = this.source;
        } else {
            this.video.src = this.source; 
        }
    }

    addEventListeners() {
        
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.video.addEventListener('click', () => this.togglePlay());

        
        this.video.addEventListener('play', () => this.playBtn.innerText = '⏸');
        this.video.addEventListener('pause', () => this.playBtn.innerText = '▶');

        
        this.volumeSlider.addEventListener('input', (e) => {
            this.video.volume = e.target.value;
        });

        
        this.fsBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    togglePlay() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}
