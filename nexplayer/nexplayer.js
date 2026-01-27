// nexplayer.js
class NexPlayer {
    constructor(config) {
        this.selector = config.selector;
        this.source = config.source;
        this.poster = config.poster || '';
        this.container = document.querySelector(this.selector);
        
        // স্টেট
        this.hls = null;
        this.init();
    }

    init() {
        // ১. মডার্ন HTML স্ট্রাকচার
        this.container.innerHTML = `
            <video class="nex-video" poster="${this.poster}" playsinline></video>
            <div class="nex-spinner"></div>
            
            <div class="nex-big-play"><i class="fa-solid fa-play"></i></div>

            <div class="nex-controls">
                <button class="nex-btn nex-play"><i class="fa-solid fa-play"></i></button>
                
                <div class="nex-volume-group" style="display:flex; align-items:center;">
                    <button class="nex-btn nex-mute"><i class="fa-solid fa-volume-high"></i></button>
                    <div class="nex-volume-container">
                        <input type="range" class="nex-slider nex-volume" min="0" max="1" step="0.1" value="1">
                    </div>
                </div>

                <div class="nex-badge"><div class="nex-badge-dot"></div> Live</div>
                
                <button class="nex-btn nex-fs"><i class="fa-solid fa-expand"></i></button>
            </div>
        `;

        // ২. এলিমেন্ট সিলেক্ট
        this.video = this.container.querySelector('.nex-video');
        this.bigPlayBtn = this.container.querySelector('.nex-big-play');
        this.playBtn = this.container.querySelector('.nex-play');
        this.muteBtn = this.container.querySelector('.nex-mute');
        this.volumeSlider = this.container.querySelector('.nex-volume');
        this.fsBtn = this.container.querySelector('.nex-fs');
        this.spinner = this.container.querySelector('.nex-spinner');

        // ৩. স্টার্ট ইঞ্জিন
        this.loadSource();
        this.addEventListeners();
    }

    loadSource() {
        this.showLoader(true);
        
        if (Hls.isSupported()) {
            this.hls = new Hls();
            this.hls.loadSource(this.source);
            this.hls.attachMedia(this.video);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.showLoader(false);
            });
            this.hls.on(Hls.Events.WAITING, () => this.showLoader(true));
            this.hls.on(Hls.Events.FRAG_LOADED, () => this.showLoader(false));
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            this.video.src = this.source;
        }
    }

    addEventListeners() {
        // প্লে/পজ লজিক
        const togglePlay = () => {
            if (this.video.paused) {
                this.video.play();
                this.updatePlayIcons(true);
                this.bigPlayBtn.style.opacity = '0'; // প্লে হলে বড় বাটন লুকাবে
                this.bigPlayBtn.style.pointerEvents = 'none';
                this.container.classList.remove('paused');
            } else {
                this.video.pause();
                this.updatePlayIcons(false);
                this.bigPlayBtn.style.opacity = '1'; // পজ হলে বড় বাটন আসবে
                this.bigPlayBtn.style.pointerEvents = 'auto';
                this.container.classList.add('paused');
            }
        };

        this.bigPlayBtn.addEventListener('click', togglePlay);
        this.playBtn.addEventListener('click', togglePlay);
        this.video.addEventListener('click', togglePlay);

        // ভলিউম লজিক
        this.volumeSlider.addEventListener('input', (e) => {
            this.video.volume = e.target.value;
            this.updateVolumeIcon(e.target.value);
        });

        // ফুলস্ক্রিন
        this.fsBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                this.container.requestFullscreen();
                this.fsBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
            } else {
                document.exitFullscreen();
                this.fsBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
            }
        });

        // কীবোর্ড শর্টকাট (Smart Feature)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault(); // পেজ স্ক্রল বন্ধ করবে
                togglePlay();
            }
            if (e.code === 'KeyF') {
                this.fsBtn.click();
            }
        });
    }

    updatePlayIcons(isPlaying) {
        const icon = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
        this.playBtn.innerHTML = icon;
        this.bigPlayBtn.innerHTML = icon;
    }

    updateVolumeIcon(vol) {
        let icon = 'fa-volume-xmark';
        if (vol > 0.5) icon = 'fa-volume-high';
        else if (vol > 0) icon = 'fa-volume-low';
        this.muteBtn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
    }

    showLoader(show) {
        this.spinner.style.display = show ? 'block' : 'none';
    }
}
