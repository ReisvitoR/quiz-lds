document.addEventListener('DOMContentLoaded', () => {
    console.log("lAB Dados Seduc");

    // Helper function to create Date objects for today with specific times
    function createDateForToday(timeString) { // e.g., "07:00:00"
        const today = new Date();
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        today.setHours(hours, minutes, seconds, 0);
        return today;
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

    // Versão para testes - simula horários diferentes
    function getSimulatedDate() {
        // Descomente uma linha abaixo para testar diferentes horários
        // return createDateForToday("08:30:00"); // Simula 8:30 (Credenciamento ativo)
        // return createDateForToday("10:30:00"); // Simula 10:30 (Fase 3 ou 4 ativa)
        // return createDateForToday("12:30:00"); // Simula 12:30 (Fase 5 ativa)
        // return createDateForToday("18:30:00"); // Simula 18:30 (Todas fases encerradas)
        return new Date(); // Usar data/hora real
    }

    // Função para inicializar o sistema de fases
    function initPhaseSystem() {
        // Configurar cliques nos headers para expandir/colapsar
        const phaseHeaders = document.querySelectorAll('.phase-header');
        
        phaseHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const phase = this.parentElement;
                const phaseContent = this.nextElementSibling;
                
                // Não permite expandir fases bloqueadas ou indisponíveis
                if (phase.classList.contains('locked') || phase.classList.contains('unavailable')) {
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
        
        // Configurar verificação de estado a cada 60 segundos
        setInterval(checkPhaseReleases, 60000);
    }

    function showLockedNotification(phaseId) {
        // Configuração de horários de disponibilidade (datas de hoje para teste)
        const schedule = {
            "credenciamento": {
                start: createDateForToday("07:00:00"),
                end: createDateForToday("09:00:00")
            },
            "fase1": {
                start: createDateForToday("09:00:00"),
                end: createDateForToday("10:00:00")
            },
            "fase2": {
                start: createDateForToday("09:00:00"),
                end: createDateForToday("10:00:00")
            },
            "fase3": {
                start: createDateForToday("10:00:00"),
                end: createDateForToday("10:30:00")
            },
            "fase4": {
                start: createDateForToday("10:30:00"),
                end: createDateForToday("11:00:00")
            },
            "fase5": {
                start: createDateForToday("11:00:00"),
                end: createDateForToday("12:30:00") 
            }
        };
        
        const currentDate = getSimulatedDate(); // Should be new Date() for today
        const phaseSchedule = schedule[phaseId];
        
        if (!phaseSchedule) {
            alert("Informações sobre esta fase não estão disponíveis.");
            return;
        }
        
        const formatTime = (date) => {
            return date.toLocaleTimeString('pt-BR', {
                hour: '2-digit', 
                minute: '2-digit'
            });
        };
        const formatDate = (date) => {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };
        
        const phaseElement = document.querySelector(`.form-phase .phase-header[data-phase="${phaseId}"]`).parentElement;
        
        if (phaseElement.classList.contains('locked')) {
            // Fase ainda não começou
            alert(`Esta fase estará disponível a partir das ${formatTime(phaseSchedule.start)} de ${formatDate(phaseSchedule.start)}.`);
        } else if (phaseElement.classList.contains('unavailable')) {
            // Fase já encerrou
            alert(`Esta fase foi encerrada às ${formatTime(phaseSchedule.end)} de ${formatDate(phaseSchedule.end)}.`);
        }
    }

    function checkPhaseReleases() {
        // Configuração de horários de disponibilidade (datas de hoje para teste)
        const schedule = {
            "credenciamento": {
                start: createDateForToday("07:00:00"),
                end: createDateForToday("09:00:00")
            },
            "fase1": {
                start: createDateForToday("09:00:00"),
                end: createDateForToday("10:00:00")
            },
            "fase2": {
                start: createDateForToday("09:00:00"),
                end: createDateForToday("10:00:00")
            },
            "fase3": {
                start: createDateForToday("10:00:00"),
                end: createDateForToday("10:30:00")
            },
            "fase4": {
                start: createDateForToday("10:30:00"),
                end: createDateForToday("11:00:00")
            },
            "fase5": {
                start: createDateForToday("11:00:00"),
                end: createDateForToday("12:30:00") 
            }
        };
        
        const currentDate = getSimulatedDate(); // Should be new Date() for today
        
        // Verificar status de cada fase
        Object.entries(schedule).forEach(([phaseId, timeWindow]) => {
            const phaseHeaderElement = document.querySelector(`.form-phase .phase-header[data-phase="${phaseId}"]`);
            if (!phaseHeaderElement) return;
            
            const phase = phaseHeaderElement.parentElement;
            const statusBadge = phaseHeaderElement.querySelector('.status-badge');
            const releaseInfo = phaseHeaderElement.querySelector('.release-date');
            const phaseContent = document.getElementById(`${phaseId}-content`);
            
            // Formatar horários para exibição
            const formatTime = (date) => {
                return date.toLocaleTimeString('pt-BR', {
                    hour: '2-digit', 
                    minute: '2-digit'
                });
            };
            
            // Verificar se estamos dentro da janela de tempo
            if (currentDate >= timeWindow.start && currentDate < timeWindow.end) {
                // Fase disponível
                phase.classList.remove('locked', 'unavailable');
                phase.classList.add('active');
                
                if (statusBadge) {
                    statusBadge.textContent = "Disponível";
                    statusBadge.className = "status-badge available";
                }
                
                if (releaseInfo) {
                    releaseInfo.textContent = `Disponível até: ${formatTime(timeWindow.end)}`;
                    releaseInfo.className = "release-date available-time";
                }
                
                unlockPhase(phaseId);

            } 
            else if (currentDate < timeWindow.start) {
                // Fase bloqueada (ainda não começou)
                phase.classList.remove('active', 'unavailable');
                phase.classList.add('locked');
                
                if (statusBadge) {
                    statusBadge.textContent = "Bloqueado";
                    statusBadge.className = "status-badge locked";
                }
                
                if (releaseInfo) {
                    releaseInfo.textContent = `Liberação: ${formatTime(timeWindow.start)}`;
                    releaseInfo.className = "release-date";
                } else if (phaseHeaderElement) { 
                    const newReleaseInfo = document.createElement('span');
                    newReleaseInfo.className = "release-date";
                    newReleaseInfo.textContent = `Liberação: ${formatTime(timeWindow.start)}`;
                    phaseHeaderElement.insertBefore(newReleaseInfo, phaseHeaderElement.querySelector('.toggle-icon'));
                }

                if (phaseContent) {
                    phaseContent.style.display = 'none'; 
                    phaseHeaderElement.classList.add('collapsed'); 
                }
            } 
            else {
                // Fase indisponível (já encerrou)
                phase.classList.remove('active', 'locked');
                phase.classList.add('unavailable');
                
                if (statusBadge) {
                    statusBadge.textContent = "Encerrado";
                    statusBadge.className = "status-badge unavailable";
                }
                
                if (releaseInfo) {
                    releaseInfo.textContent = `Encerrado às ${formatTime(timeWindow.end)}`;
                    releaseInfo.className = "release-date unavailable-time";
                }
                
                if (phaseContent) {
                    phaseContent.innerHTML = `
                        <div class="google-form-container">
                            <div class="unavailable-overlay">
                                <i class="unavailable-icon">⏱️</i>
                                <p>Este formulário foi encerrado às ${formatTime(timeWindow.end)}</p>
                            </div>
                        </div>
                    `;
                    phaseContent.style.display = 'block'; 
                    phaseHeaderElement.classList.remove('collapsed'); 
                }
            }
        });
    }

    function unlockPhase(phaseId) {
        // Encontrar o elemento da fase
        const phaseHeader = document.querySelector(`.form-phase .phase-header[data-phase="${phaseId}"]`);
        if (!phaseHeader) return;
        
        const phaseElement = phaseHeader.parentElement;
        const phaseContent = document.getElementById(`${phaseId}-content`);
        if (!phaseContent) return;
        
        // Remover classe de bloqueio
        phaseElement.classList.remove('locked', 'unavailable');
        phaseElement.classList.add('active');
        
        // Carregar o formulário apropriado
        const formURLs = {
            "credenciamento": "https://forms.gle/credID",
            "fase1": "https://forms.gle/fase1ID",
            "fase2": "https://forms.gle/fase2ID",
            "fase3": "https://forms.gle/fase3ID",
            "fase4": "https://forms.gle/fase4ID",
            "fase5": "https://forms.gle/fase5ID"
        };
        
        // Remover overlay de bloqueio
        const lockedOverlay = phaseContent.querySelector('.locked-overlay, .unavailable-overlay');
        if (lockedOverlay) lockedOverlay.remove();
        
        // Verificar se já existe um iframe
        if (!phaseContent.querySelector('iframe')) {
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
        
        /* Estilização para status badges */
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: bold;
            margin-left: 10px;
            color: white; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-badge.locked {
            background-color: #9e9e9e; /* Cinza (Material Design Grey 500) */
        }
        .status-badge.available {
            background-color: #4CAF50; /* Verde (Material Design Green 500) */
        }
        .status-badge.unavailable {
            background-color: #f44336; /* Vermelho (Material Design Red 500) */
        }

        /* Estilização da fase e cabeçalho com base no estado */
        .form-phase {
            /* Default border, can be overridden */
            border-left: 5px solid #ccc; 
        }

        .form-phase.locked {
            border-left-color: #9e9e9e !important; /* Cinza */
        }
        .form-phase.locked .phase-header {
            color: #757575; /* Cinza para o nome da fase */
        }

        .form-phase.active {
            border-left-color: #4CAF50 !important; /* Verde */
        }
        .form-phase.active .phase-header {
            color: #4CAF50; /* Verde para o nome da fase */
        }
        
        .form-phase.unavailable {
            border-left-color: #f44336 !important; /* Vermelho */
            opacity: 0.8; 
        }
        .form-phase.unavailable .phase-header {
            color: #f44336; /* Vermelho para o nome da fase */
        }
        
        /* Cor do ícone de toggle - para não herdar a cor do estado */
        .phase-header .toggle-icon {
            color: #333; /* Ou outra cor neutra desejada */
        }
        
        .release-date.unavailable-time {
            color: #d32f2f; /* Mantém vermelho para data de encerramento */
        }
        
        .release-date.available-time {
            color: #4CAF50; /* Mantém verde para data de disponibilidade */
            font-weight: 500;
        }
        
        .unavailable-overlay {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
            background: rgba(245,245,245,0.9);
            border-radius: 6px;
            border: 1px dashed #ccc;
            color: #757575;
        }
        
        .unavailable-icon {
            font-size: 40px;
            margin-bottom: 15px;
        }
    `;
    document.head.appendChild(styleSheet);
});