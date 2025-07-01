document.addEventListener('DOMContentLoaded', () => {
    console.log("LAB Dados Seduc");

    // Helper function to create Date objects for 01/07/2025 with specific times
    function createDateForToday(timeString) { // e.g., "07:00:00"
        // Correção: Usar 'T' para evitar problemas de fuso horário (timezone)
        const testDate = new Date('2025-07-01T00:00:00');
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        testDate.setHours(hours, minutes, seconds, 0);
        return testDate;
    }

    // --- Particle Class Definition (used by manageParticleCanvas) ---
    class Particle {
        constructor(canvasWidth, canvasHeight, ctx, colorBase = "173, 216, 230") {
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;
            this.ctx = ctx;
            this.x = Math.random() * this.canvasWidth;
            this.y = Math.random() * this.canvasHeight;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = `rgba(${colorBase}, ${Math.random() * 0.5 + 0.2})`;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.size > 0.1) this.size -= 0.01;

            if (this.x < 0) this.x = this.canvasWidth;
            if (this.x > this.canvasWidth) this.x = 0;
            if (this.y < 0) this.y = this.canvasHeight;
            if (this.y > this.canvasHeight) this.y = 0;
        }

        draw() {
            if (this.size <= 0.1) return;
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    function manageParticleCanvas(canvasElement) {
        if (!canvasElement) return;

        const ctx = canvasElement.getContext('2d');
        let particlesArray = [];
        let animationFrameId;

        const setupCanvas = () => {
            canvasElement.width = canvasElement.offsetWidth;
            canvasElement.height = canvasElement.offsetHeight;
        };

        const initParticles = () => {
            particlesArray = [];
            const numParticles = Math.min(150, Math.max(20, Math.floor(canvasElement.width / 20)));
            for (let i = 0; i < numParticles; i++) {
                particlesArray.push(new Particle(canvasElement.width, canvasElement.height, ctx));
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            for (let i = particlesArray.length - 1; i >= 0; i--) {
                const p = particlesArray[i];
                p.update();
                p.draw();
                if (p.size <= 0.1) {
                    particlesArray.splice(i, 1);
                    particlesArray.push(new Particle(canvasElement.width, canvasElement.height, ctx));
                }
            }
            animationFrameId = requestAnimationFrame(animateParticles);
        };

        setupCanvas();
        initParticles();
        animateParticles();

        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                cancelAnimationFrame(animationFrameId);
                setupCanvas();
                initParticles();
                animateParticles();
            }, 250);
        };
        window.addEventListener('resize', handleResize);
    }

    manageParticleCanvas(document.getElementById('dynamicHeaderCanvas'));
    manageParticleCanvas(document.getElementById('dynamicFooterCanvas'));

    const player = document.getElementById('player');
    const dataItemContainer = document.getElementById('dataItemContainer');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const gameArea = document.getElementById('navbarGame');
    const instructions = document.getElementById('instructions');

    if (player && dataItemContainer && scoreDisplay && gameArea && instructions) {
        const isMobile = window.innerWidth <= 768;
        
        const gameSettings = {
            desktop: {
                gravity: 0.8,
                jumpStrength: -15,
                initialSpeed: 3,
                speedIncrement: 0.5,
                initialSpawnInterval: 2000,
                spawnIntervalDecrement: 150
            },
            mobile: {
                gravity: 0.6,
                jumpStrength: -14,
                initialSpeed: 2.5,
                speedIncrement: 0.25,
                initialSpawnInterval: 2500,
                spawnIntervalDecrement: 100
            }
        };
        
        const settings = isMobile ? gameSettings.mobile : gameSettings.desktop;

        let score = 0;
        let playerY = 0;
        let playerVelocityY = 0;
        let isJumping = false;
        const gravity = settings.gravity;
        const jumpStrength = settings.jumpStrength;
        const playerHeight = 50;
        let gameSpeed = settings.initialSpeed;
        let dataItems = [];
        let spawnInterval = settings.initialSpawnInterval;
        let dataItemSpawner;
        let animationFrameId;
        let isPaused = false;

        const areaProibida = 110;

        function jump() {
            if (!isJumping) {
                isJumping = true;
                playerVelocityY = jumpStrength;
                if (instructions) instructions.style.display = 'none';
                playJumpSound();
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowUp' || e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        }, { passive: false });
        
        if (player) {
            player.addEventListener('click', jump);
        }
        gameArea.addEventListener('click', jump);

        function spawnDataItem() {
            if (isPaused) return;
            const dataItem = document.createElement('div');
            dataItem.classList.add('data-item');
            dataItem.style.position = 'absolute';
            dataItem.style.right = '-30px';

            const gameAreaHeight = gameArea.clientHeight;
            const itemHeight = 30;
            let minSpawnBottom = areaProibida;
            let maxSpawnBottom = gameAreaHeight - itemHeight - 10;

            if (minSpawnBottom >= maxSpawnBottom) {
                maxSpawnBottom = minSpawnBottom + 40;
            }

            let itemSpawnBottom = minSpawnBottom + Math.random() * (maxSpawnBottom - minSpawnBottom);
            dataItem.style.bottom = `${itemSpawnBottom}px`;

            dataItemContainer.appendChild(dataItem);
            dataItems.push({
                element: dataItem,
                x: gameArea.offsetWidth,
            });
        }

        function showCongratulationsMessage() {
            const congratsContainer = document.createElement('div');
            congratsContainer.id = 'congrats-message-container';
            Object.assign(congratsContainer.style, {
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', padding: '30px',
                backgroundColor: 'rgba(0, 128, 0, 0.85)', color: 'white',
                fontSize: '28px', fontWeight: 'bold', textAlign: 'center',
                zIndex: '10000', borderRadius: '15px',
                boxShadow: '0 0 15px rgba(0,0,0,0.5)'
            });
            congratsContainer.innerHTML = "Parabéns!<br> Você alcançou a meta!";
            document.body.appendChild(congratsContainer);
        }

        function hideCongratulationsMessage() {
            const congratsContainer = document.getElementById('congrats-message-container');
            if (congratsContainer) congratsContainer.remove();
        }

        function showConfetti() {
            const confettiContainer = document.createElement('div');
            confettiContainer.id = 'confetti-container';
            Object.assign(confettiContainer.style, {
                position: 'fixed', top: '0', left: '0',
                width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: '9999'
            });
            document.body.appendChild(confettiContainer);

            const confettiCount = 200;
            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                Object.assign(confetti.style, {
                    position: 'absolute', width: '10px', height: '10px',
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
                    opacity: `${Math.random() * 0.5 + 0.5}`,
                    top: `${Math.random() * 100 - 10}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `fall ${Math.random() * 2 + 3}s ${Math.random() * 2}s ease-out forwards`,
                    transform: `rotate(${Math.random() * 360}deg)`
                });
                confettiContainer.appendChild(confetti);
            }

            setTimeout(() => {
                if (confettiContainer) confettiContainer.remove();
            }, 5000);
        }

        function playCongratsSound() {
            const context = getAudioContext();
            if (!context) return;
            const o1 = context.createOscillator();
            const o2 = context.createOscillator();
            const gain = context.createGain();

            o1.type = 'triangle';
            o2.type = 'square';
            o1.frequency.setValueAtTime(523, context.currentTime); 
            o2.frequency.setValueAtTime(784, context.currentTime); 

            gain.gain.setValueAtTime(0.18, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.7);

            o1.connect(gain);
            o2.connect(gain);
            gain.connect(context.destination);

            o1.start(context.currentTime);
            o2.start(context.currentTime + 0.15);
            o1.stop(context.currentTime + 0.7);
            o2.stop(context.currentTime + 0.7);
        }

        function restartGame() {
            score = 0;
            gameSpeed = settings.initialSpeed;
            spawnInterval = settings.initialSpawnInterval;
            playerY = 0;
            playerVelocityY = 0;
            isJumping = false;
            player.style.transform = `translateY(0px)`;
            scoreDisplay.textContent = `Pontos: ${score}`;
            dataItems.forEach(item => item.element.remove());
            dataItems = [];
            if (dataItemSpawner) clearInterval(dataItemSpawner);
            dataItemSpawner = setInterval(spawnDataItem, spawnInterval);
            if (instructions) instructions.style.display = 'block';
            if (!isPaused) updateGame();
        }

        function updateGame() {
            if (isPaused) return;

            if (isJumping) {
                playerVelocityY += gravity;
                playerY += playerVelocityY;

                const maxJump = gameArea.clientHeight - playerHeight - 10;
                if (-playerY > maxJump) {
                    playerY = -maxJump;
                    playerVelocityY = 0;
                }

                if (playerY > 0) {
                    playerY = 0;
                    playerVelocityY = 0;
                    isJumping = false;
                }
                player.style.transform = `translateY(${playerY}px)`;
            }

            for (let i = dataItems.length - 1; i >= 0; i--) {
                const item = dataItems[i];
                item.x -= gameSpeed;
                item.element.style.transform = `translateX(${item.x - gameArea.offsetWidth}px)`;

                const playerRect = player.getBoundingClientRect();
                const itemRect = item.element.getBoundingClientRect();

                if (
                    playerRect.left < itemRect.right &&
                    playerRect.right > itemRect.left &&
                    playerRect.top < itemRect.bottom &&
                    playerRect.bottom > itemRect.top
                ) {
                    item.element.remove();
                    dataItems.splice(i, 1);
                    score++;
                    scoreDisplay.textContent = `Pontos: ${score}`;
                    playCollectSound();

                    gameSpeed += settings.speedIncrement;

                    if (score === 10) {
                        showCongratulationsMessage();
                        showConfetti();
                        playCongratsSound();
                        cancelAnimationFrame(animationFrameId);
                        clearInterval(dataItemSpawner);
                        setTimeout(() => {
                            hideCongratulationsMessage();
                            restartGame();
                        }, 5000);
                        return;
                    }

                    if (score % 5 === 0 && score > 0) {
                        if (spawnInterval > 800) spawnInterval -= settings.spawnIntervalDecrement;
                        clearInterval(dataItemSpawner);
                        dataItemSpawner = setInterval(spawnDataItem, spawnInterval);
                    }
                    continue;
                }

                if (itemRect.right < gameArea.getBoundingClientRect().left - 10) {
                    item.element.remove();
                    dataItems.splice(i, 1);
                    score = 0;
                    gameSpeed = settings.initialSpeed;
                    scoreDisplay.textContent = `Pontos: ${score}`;
                }
            }
            if (score !== 10) {
                animationFrameId = requestAnimationFrame(updateGame);
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isPaused = true;
                clearInterval(dataItemSpawner);
                cancelAnimationFrame(animationFrameId);
            } else {
                if (isPaused) {
                    isPaused = false;
                    dataItemSpawner = setInterval(spawnDataItem, spawnInterval);
                    updateGame();
                }
            }
        });

        dataItemSpawner = setInterval(spawnDataItem, spawnInterval);
        updateGame();

    } else {
        console.warn("Game elements not found, game logic will not run.");
    }

    let audioContext;
    function getAudioContext() {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.", e);
                return null;
            }
        }
        return audioContext;
    }

    function playJumpSound() {
        const context = getAudioContext();
        if (!context) return;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, context.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.15, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.2);
    }

    function playCollectSound() {
        const context = getAudioContext();
        if (!context) return;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.15, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
    }

    function getSimulatedDate() {
        const testDate = new Date('2025-07-01T' + new Date().toTimeString().split(' ')[0]);
        return testDate;
    }

    function initPhaseSystem() {
        const phaseHeaders = document.querySelectorAll('.phase-header');
        
        function reorganizeHeadersForMobile() {
            phaseHeaders.forEach(header => {
                if (header.querySelector('.phase-header-info')) return;
                
                const statusBadge = header.querySelector('.status-badge');
                const releaseDate = header.querySelector('.release-date');
                const toggleIcon = header.querySelector('.toggle-icon');
                
                const infoContainer = document.createElement('div');
                infoContainer.className = 'phase-header-info';
                
                if (statusBadge) infoContainer.appendChild(statusBadge);
                if (releaseDate) infoContainer.appendChild(releaseDate);
                if (toggleIcon) infoContainer.appendChild(toggleIcon);
                
                header.appendChild(infoContainer);
            });
        }
        
        reorganizeHeadersForMobile();
        
        phaseHeaders.forEach(header => {
            const phaseContent = header.nextElementSibling;
            if (phaseContent) {
                phaseContent.style.display = 'none';
                header.classList.add('collapsed');
            }
        });
        
        phaseHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const phase = this.parentElement;
                const phaseContent = this.nextElementSibling;
                
                if (phase.classList.contains('locked') || phase.classList.contains('unavailable') || phase.classList.contains('completed')) {
                    if (!phase.classList.contains('completed')) {
                        showLockedNotification(this.dataset.phase);
                    }
                    return;
                }
                
                if (phase.classList.contains('active')) {
                    const toggleIcon = this.querySelector('.toggle-icon');
                    if (phaseContent.style.display === 'block') {
                        phaseContent.style.display = 'none';
                        this.classList.add('collapsed');
                        if (toggleIcon) toggleIcon.textContent = '▼';
                    } else {
                        phaseContent.style.display = 'block';
                        this.classList.remove('collapsed');
                        if (toggleIcon) toggleIcon.textContent = '▲';
                        
                        const formContainer = phaseContent.querySelector('.form-ready');
                        if (formContainer && !phaseContent.querySelector('.form-loaded')) {
                            const formUrl = formContainer.dataset.formUrl;
                            const phaseId = this.dataset.phase;
                            
                            formContainer.innerHTML = `
                                <div class="google-form-container form-loaded">
                                    <iframe src="${formUrl}" class="google-form-iframe" frameborder="0" marginheight="0" marginwidth="0">Carregando…</iframe>
                                </div>
                            `;
                            
                            const iframe = formContainer.querySelector('iframe');
                            let isInitialLoad = true;

                            iframe.onload = () => {
                                if (isInitialLoad) {
                                    isInitialLoad = false;
                                    return;
                                }
                                markPhaseAsCompleted(phaseId);
                            };
                        }
                    }
                }
            });
        });
        
        checkPhaseReleases();
        setInterval(checkPhaseReleases, 60000);
        window.addEventListener('focus', checkCompletedPhases);
        checkCompletedPhases();
    }

    function markPhaseAsCompleted(phaseId) {
        const phaseHeader = document.querySelector(`.phase-header[data-phase="${phaseId}"]`);
        if (!phaseHeader) return;

        const phaseElement = phaseHeader.parentElement;
        const phaseContent = document.getElementById(`${phaseId}-content`);

        if (phaseContent) {
            phaseContent.style.display = 'none';
            phaseHeader.classList.add('collapsed');
        }

        phaseElement.classList.remove('active');
        phaseElement.classList.add('completed');
        
        const statusBadge = phaseHeader.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.textContent = "Concluído";
            statusBadge.className = "status-badge completed";
        }
        
        const toggleIcon = phaseHeader.querySelector('.toggle-icon');
        if (toggleIcon) toggleIcon.textContent = '✔';

        let completedPhases = JSON.parse(localStorage.getItem('completedPhases')) || [];
        if (!completedPhases.includes(phaseId)) {
            completedPhases.push(phaseId);
            localStorage.setItem('completedPhases', JSON.stringify(completedPhases));
        }
    }

    function checkCompletedPhases() {
        let completedPhases = JSON.parse(localStorage.getItem('completedPhases')) || [];
        completedPhases.forEach(phaseId => {
            const phaseHeader = document.querySelector(`.phase-header[data-phase="${phaseId}"]`);
            if (phaseHeader && !phaseHeader.parentElement.classList.contains('completed')) {
                 const phaseElement = phaseHeader.parentElement;
                 phaseElement.classList.remove('active', 'locked', 'unavailable');
                 phaseElement.classList.add('completed');
                 
                 const statusBadge = phaseHeader.querySelector('.status-badge');
                 if (statusBadge) {
                    statusBadge.textContent = "Concluído";
                    statusBadge.className = "status-badge completed";
                 }
                 const toggleIcon = phaseHeader.querySelector('.toggle-icon');
                 if (toggleIcon) toggleIcon.textContent = '✔';
            }
        });
    }

    function showLockedNotification(phaseId) {
        const schedule = {
            "credenciamento": { start: createDateForToday("07:00:00"), end: createDateForToday("09:00:00") },
            "fase1": { start: createDateForToday("09:00:00"), end: createDateForToday("10:00:00") },
            "fase2": { start: createDateForToday("09:00:00"), end: createDateForToday("10:00:00") },
            "fase3": { start: createDateForToday("10:00:00"), end: createDateForToday("10:30:00") },
            "fase4": { start: createDateForToday("10:30:00"), end: createDateForToday("11:00:00") },
            "fase5": { start: createDateForToday("11:00:00"), end: createDateForToday("12:30:00") }
        };
        
        const phaseSchedule = schedule[phaseId];
        if (!phaseSchedule) {
            alert("Informações sobre esta fase não estão disponíveis.");
            return;
        }
        
        const formatTime = (date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const formatDate = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const phaseElement = document.querySelector(`.form-phase .phase-header[data-phase="${phaseId}"]`).parentElement;
        
        if (phaseElement.classList.contains('locked')) {
            alert(`Esta fase estará disponível a partir das ${formatTime(phaseSchedule.start)} de ${formatDate(phaseSchedule.start)}.`);
        } else if (phaseElement.classList.contains('unavailable')) {
            alert(`Esta fase foi encerrada às ${formatTime(phaseSchedule.end)} de ${formatDate(phaseSchedule.end)}.`);
        }
    }

    function checkPhaseReleases() {
        const schedule = {
            "credenciamento": { start: createDateForToday("07:00:00"), end: createDateForToday("09:00:00") },
            "fase1": { start: createDateForToday("09:00:00"), end: createDateForToday("10:00:00") },
            "fase2": { start: createDateForToday("09:00:00"), end: createDateForToday("10:00:00") },
            "fase3": { start: createDateForToday("10:00:00"), end: createDateForToday("10:30:00") },
            "fase4": { start: createDateForToday("10:30:00"), end: createDateForToday("11:00:00") },
            "fase5": { start: createDateForToday("11:00:00"), end: createDateForToday("12:30:00") }
        };
        
        const currentDate = getSimulatedDate();
        
        Object.entries(schedule).forEach(([phaseId, timeWindow]) => {
            const phaseHeaderElement = document.querySelector(`.form-phase .phase-header[data-phase="${phaseId}"]`);
            if (!phaseHeaderElement) return;
            
            const phase = phaseHeaderElement.parentElement;
            if (phase.classList.contains('completed')) return;

            const statusBadge = phaseHeaderElement.querySelector('.status-badge');
            const releaseInfo = phaseHeaderElement.querySelector('.release-date');
            const phaseContent = document.getElementById(`${phaseId}-content`);
            const formatTime = (date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            if (currentDate >= timeWindow.start && currentDate < timeWindow.end) {
                phase.classList.remove('locked', 'unavailable');
                phase.classList.add('active');
                if (statusBadge) { statusBadge.textContent = "Disponível"; statusBadge.className = "status-badge available"; }
                if (releaseInfo) { releaseInfo.textContent = `Disponível até: ${formatTime(timeWindow.end)}`; releaseInfo.className = "release-date available-time"; }
                const toggleIcon = phaseHeaderElement.querySelector('.toggle-icon');
                if (toggleIcon && phaseContent && phaseContent.style.display !== 'block') { toggleIcon.textContent = '▼'; }
                unlockPhase(phaseId);
            } 
            else if (currentDate < timeWindow.start) {
                phase.classList.remove('active', 'unavailable');
                phase.classList.add('locked');
                if (statusBadge) { statusBadge.textContent = "Bloqueado"; statusBadge.className = "status-badge locked"; }
                if (releaseInfo) { releaseInfo.textContent = `Liberação: ${formatTime(timeWindow.start)}`; } 
                else if (phaseHeaderElement) { 
                    const newReleaseInfo = document.createElement('span');
                    newReleaseInfo.className = "release-date";
                    newReleaseInfo.textContent = `Liberação: ${formatTime(timeWindow.start)}`;
                    const infoContainer = phaseHeaderElement.querySelector('.phase-header-info');
                    const toggleIcon = phaseHeaderElement.querySelector('.toggle-icon');
                    if (infoContainer && toggleIcon) { infoContainer.insertBefore(newReleaseInfo, toggleIcon); } 
                    else { phaseHeaderElement.insertBefore(newReleaseInfo, phaseHeaderElement.querySelector('.toggle-icon')); }
                }
                if (phaseContent) {
                    phaseContent.style.display = 'none'; 
                    phaseHeaderElement.classList.add('collapsed');
                    const toggleIcon = phaseHeaderElement.querySelector('.toggle-icon');
                    if (toggleIcon) toggleIcon.textContent = '🔒';
                }
            } 
            else {
                phase.classList.remove('active', 'locked');
                phase.classList.add('unavailable');
                if (statusBadge) { statusBadge.textContent = "Encerrado"; statusBadge.className = "status-badge unavailable"; }
                if (releaseInfo) { releaseInfo.textContent = `Encerrado às ${formatTime(timeWindow.end)}`; releaseInfo.className = "release-date unavailable-time"; }
                if (phaseContent) {
                    phaseContent.style.display = 'none'; 
                    phaseHeaderElement.classList.add('collapsed');
                    const toggleIcon = phaseHeaderElement.querySelector('.toggle-icon');
                    if (toggleIcon) toggleIcon.textContent = '⏱️';
                }
            }
        });
    }

    function unlockPhase(phaseId) {
        const phaseHeader = document.querySelector(`.form-phase .phase-header[data-phase="${phaseId}"]`);
        if (!phaseHeader) return;
        
        const phaseElement = phaseHeader.parentElement;
        const phaseContent = document.getElementById(`${phaseId}-content`);
        if (!phaseContent) return;
        
        phaseElement.classList.remove('locked', 'unavailable');
        phaseElement.classList.add('active');
        
        const formURLs = {
            "credenciamento": "https://docs.google.com/forms/d/e/1FAIpQLSdFVowu6LE4EypsOQ5QlcwgKacCWKXYI8N30C7L3aRWegZY4g/viewform?embedded=true",
            "fase1": "https://docs.google.com/forms/d/e/1FAIpQLSdFVowu6LE4EypsOQ5QlcwgKacCWKXYI8N30C7L3aRWegZY4g/viewform?embedded=true",
            "fase2": "https://docs.google.com/forms/d/e/1FAIpQLSdFVowu6LE4EypsOQ5QlcwgKacCWKXYI8N30C7L3aRWegZY4g/viewform?embedded=true",
            "fase3": "https://docs.google.com/forms/d/e/1FAIpQLSdFVowu6LE4EypsOQ5QlcwgKacCWKXYI8N30C7L3aRWegZY4g/viewform?embedded=true",
            "fase4": "https://docs.google.com/forms/d/e/1FAIpQLSdFVowu6LE4EypsOQ5QlcwgKacCWKXYI8N30C7L3aRWegZY4g/viewform?embedded=true",
            "fase5": "https://docs.google.com/forms/d/e/1FAIpQLSdFVowu6LE4EypsOQ5QlcwgKacCWKXYI8N30C7L3aRWegZY4g/viewform?embedded=true"
        };
        
        const lockedOverlay = phaseContent.querySelector('.locked-overlay, .unavailable-overlay');
        if (lockedOverlay) lockedOverlay.remove();
        
        if (!phaseContent.querySelector('.form-loaded') && !phaseContent.querySelector('.form-ready')) {
            phaseContent.innerHTML = `
                <div class="form-ready" data-form-url="${formURLs[phaseId]}">
                    <div class="loading-message">
                        <p>Clique para carregar o formulário...</p>
                    </div>
                </div>
            `;
        }
        
        phaseContent.style.display = 'none';
        phaseHeader.classList.add('collapsed');
    }

    initPhaseSystem();

    if (!document.querySelector('meta[name="viewport"]')) {
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewport);
    }

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes fall {
            0% { transform: translateY(-20vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 10px; color: white; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-badge.locked { background-color: #9e9e9e; }
        .status-badge.available { background-color: #4CAF50; }
        .status-badge.unavailable { background-color: #f44336; }
        .status-badge.completed { background-color: #9c27b0; }
        .form-phase { border-left: 5px solid #ccc; margin-bottom: 10px; }
        .form-phase.locked { border-left-color: #9e9e9e !important; }
        .form-phase.locked .phase-header { color: #757575; cursor: not-allowed; }
        .form-phase.active { border-left-color: #4CAF50 !important; }
        .form-phase.active .phase-header { color: #4CAF50; cursor: pointer; }
        .form-phase.active .phase-header:hover { background-color: #f5f5f5; }
        .form-phase.unavailable { border-left-color: #f44336 !important; opacity: 0.8; }
        .form-phase.unavailable .phase-header { color: #f44336; cursor: not-allowed; }
        .form-phase.completed { border-left-color: #9c27b0 !important; }
        .form-phase.completed .phase-header { color: #9c27b0; cursor: default; }
        .form-phase.completed .phase-header:hover { background-color: #fafafa; }
        .phase-header { display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; background-color: #fafafa; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s ease; flex-wrap: wrap; gap: 10px; }
        .phase-header h4 { margin: 0; flex-grow: 1; min-width: 0; }
        .phase-header-info { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; }
        .phase-header .toggle-icon { color: #666; font-size: 16px; margin-left: 10px; transition: transform 0.2s ease; flex-shrink: 0; }
        .phase-header.collapsed .toggle-icon { transform: rotate(0deg); }
        .phase-header:not(.collapsed) .toggle-icon { transform: rotate(180deg); }
        .release-date { font-size: 0.8em; margin-left: 10px; margin-right: 10px; white-space: nowrap; }
        .release-date.unavailable-time { color: #d32f2f; }
        .release-date.available-time { color: #4CAF50; font-weight: 500; }
        .loading-message, .unavailable-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; background: rgba(245,245,245,0.9); border-radius: 6px; color: #666; }
        .unavailable-icon { font-size: 40px; margin-bottom: 15px; }
        .google-form-container { padding: 10px; background: #fff; }
        .google-form-iframe { width: 100%; height: 80vh; border: none; }

        @media (max-width: 768px) {
            .phase-header { padding: 12px 15px; flex-direction: column; align-items: flex-start; gap: 8px; }
            .phase-header h4 { font-size: 1.1em; width: 100%; }
            .phase-header-info { width: 100%; justify-content: space-between; align-items: center; }
            .status-badge { font-size: 0.75em; padding: 3px 6px; margin-left: 0; }
            .release-date { font-size: 0.75em; margin: 0; flex-grow: 1; text-align: center; }
            .phase-header .toggle-icon { margin-left: 0; font-size: 18px; }
            .google-form-container { padding: 5px; }
            .google-form-iframe { height: 75vh; }
        }
        @media (max-width: 480px) {
            .phase-header { padding: 10px 12px; }
            .phase-header h4 { font-size: 1em; }
            .status-badge { font-size: 0.7em; padding: 2px 5px; }
            .release-date { font-size: 0.7em; }
            .google-form-iframe { height: 70vh; }
        }
        @media (hover: none) and (pointer: coarse) {
            .phase-header { min-height: 44px; -webkit-tap-highlight-color: rgba(0,0,0,0.1); }
            .form-phase.active .phase-header:active { background-color: #e8e8e8; }
        }
    `;
    document.head.appendChild(styleSheet);
});