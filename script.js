document.addEventListener('DOMContentLoaded', () => {
    console.log("Site Mundo dos Dados - O Jogo! Carregado!");

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
        let score = 0;
        let playerY = 0;
        let playerVelocityY = 0;
        let isJumping = false;
        const gravity = 0.8;
        const jumpStrength = -15;
        const playerBaseBottom = 10;
        const playerHeight = 50;
        let gameSpeed = 3;
        let dataItems = [];
        let spawnInterval = 2000;
        let dataItemSpawner;
        let animationFrameId;
        let isPaused = false;

        const areaProibida = 110; // altura do Acelera Seduc + pontos

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
        });
        if (player) {
            player.addEventListener('click', jump);
        }
        gameArea.addEventListener('click', (event) => {
            jump();
        });

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

            if (minSpawnBottom > maxSpawnBottom) {
                minSpawnBottom = areaProibida;
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
            gameSpeed = 3;
            spawnInterval = 2000;
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

                // Impede o player de sair pelo topo do game
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

                    gameSpeed += 1.1;

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
                        if (spawnInterval > 800) spawnInterval -= 100;
                        clearInterval(dataItemSpawner);
                        dataItemSpawner = setInterval(spawnDataItem, spawnInterval);
                    }
                    continue;
                }

                if (itemRect.right < gameArea.getBoundingClientRect().left - 10) {
                    item.element.remove();
                    dataItems.splice(i, 1);
                    score = 0;
                    gameSpeed = 3;
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

    // Função para inicializar o sistema de fases
    function initPhaseSystem() {
        // Configurar cliques nos headers para expandir/colapsar
        const phaseHeaders = document.querySelectorAll('.phase-header');
        
        phaseHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const phase = this.parentElement;
                const phaseContent = this.nextElementSibling;
                
                // Não permite expandir fases bloqueadas
                if (phase.classList.contains('locked')) {
                    showLockedNotification(this.dataset.phase);
                    return;
                }
                
                // Toggle expand/collapse
                if (phaseContent.style.display === 'block') {
                    phaseContent.style.display = 'none';
                    this.classList.add('collapsed');
                } else {
                    phaseContent.style.display = 'block';
                    this.classList.remove('collapsed');
                }
            });
        });
        
        // Verificar fases que devem ser desbloqueadas
        checkPhaseReleases();
    }

    function showLockedNotification(phaseId) {
        // Mostrar uma notificação quando o usuário tenta acessar uma fase bloqueada
        const releaseElement = document.querySelector(`[data-phase="${phaseId}"] .release-date`);
        const releaseDate = releaseElement ? releaseElement.textContent.replace('Liberação: ', '') : 'em breve';
        
        alert(`Esta fase está bloqueada e será liberada ${releaseDate}.`);
    }

    function checkPhaseReleases() {
        // Datas de liberação de cada fase (formato: YYYY-MM-DD)
        const releaseSchedule = {
            "fase1": "2025-05-25",
            "fase2": "2025-06-01",
            "fase3": "2025-06-08",
            "fase4": "2025-06-15",
            "fase5": "2025-06-22"
        };
        
        const currentDate = new Date();
        
        // Verificar cada fase
        for (const [phaseId, releaseDate] of Object.entries(releaseSchedule)) {
            const releaseTime = new Date(releaseDate).getTime();
            
            // Se a data atual é posterior à data de liberação
            if (currentDate.getTime() >= releaseTime) {
                unlockPhase(phaseId);
            }
        }
    }

    function unlockPhase(phaseId) {
        // Encontrar o elemento da fase
        const phaseElement = document.querySelector(`.form-phase .phase-header[data-phase="${phaseId}"]`).parentElement;
        const phaseContent = document.getElementById(`${phaseId}-content`);
        
        // Remover classe de bloqueio
        phaseElement.classList.remove('locked');
        phaseElement.classList.add('active');
        
        // Atualizar badge de status
        const statusBadge = phaseElement.querySelector('.status-badge');
        statusBadge.textContent = "Disponível";
        statusBadge.classList.remove('locked');
        statusBadge.classList.add('available');
        
        // Remover data de liberação
        const releaseDate = phaseElement.querySelector('.release-date');
        if (releaseDate) releaseDate.remove();
        
        // Carregar o formulário apropriado
        const formURLs = {
            "fase1": "https://forms.gle/formID1",
            "fase2": "https://forms.gle/formID2",
            "fase3": "https://forms.gle/formID3",
            "fase4": "https://forms.gle/formID4",
            "fase5": "https://forms.gle/formID5"
        };
        
        // Remover overlay de bloqueio
        const lockedOverlay = phaseContent.querySelector('.locked-overlay');
        if (lockedOverlay) lockedOverlay.remove();
        
        // Carregar o iframe com o formulário
        phaseContent.innerHTML = `
            <div class="google-form-container">
                <iframe 
                    src="${formURLs[phaseId]}" 
                    width="100%" 
                    height="600" 
                    frameborder="0" 
                    marginheight="0" 
                    marginwidth="0"
                    allowfullscreen="true"
                    loading="lazy">
                    Carregando…
                </iframe>
                <p class="form-note"><strong>Nota:</strong> Data Quiz - ${phaseId.charAt(0).toUpperCase() + phaseId.slice(1)}</p>
            </div>
        `;
    }

    // Inicialização do sistema de fases
    initPhaseSystem();

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes fall {
            0% {
                transform: translateY(-20vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(120vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styleSheet);
});