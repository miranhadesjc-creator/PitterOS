/**
 * Games App - Entretenimento básico para o Sistema Operacional
 */
export class GamesApp {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.windowId = 'window-games';
        this.canvas = null;
        this.ctx = null;
        this.activeGame = null;
        this.score = 0;
        this.gameLoop = null;
        this.isGameOver = false;

        // Snake Variables
        this.snake = [];
        this.food = {};
        this.direction = 'right';
        this.gridSize = 20;

        // Pacman Variables
        this.pacman = {};
        this.ghosts = [];
        this.dots = [];
        this.walls = [];
    }

    init() {
        const win = document.getElementById(this.windowId);
        if (!win) return;

        this.canvas = document.getElementById('games-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }

        this.setupEventListeners();
        this.showMenu();
    }

    setupEventListeners() {
        // Menu Buttons
        document.getElementById('btn-snake').addEventListener('click', () => this.startSnake());
        document.getElementById('btn-pacman').addEventListener('click', () => this.startPacman());
        document.getElementById('btn-menu').addEventListener('click', () => this.showMenu());

        // Keyboard Controls
        window.addEventListener('keydown', (e) => this.handleInput(e));
    }

    handleInput(e) {
        // Só processa input se a janela estiver ativa
        const win = document.getElementById(this.windowId);
        if (!win || win.classList.contains('hidden')) return;

        // Se estiver no menu, ignora
        if (!this.activeGame) return;

        if (this.activeGame === 'snake') {
            this.handleSnakeInput(e.key);
        } else if (this.activeGame === 'pacman') {
            this.handlePacmanInput(e.key);
        }
    }

    showMenu() {
        this.stopGame();
        this.activeGame = null;

        document.getElementById('games-menu').classList.remove('hidden');
        document.getElementById('games-play-area').classList.add('hidden');
        document.getElementById('game-status').innerText = 'Selecione um jogo para começar';
    }

    stopGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.isGameOver = false;
        this.score = 0;
    }

    updateScore() {
        document.getElementById('game-score').innerText = `Score: ${this.score}`;
    }

    // ==========================================
    // SNAKE GAME
    // ==========================================
    startSnake() {
        this.stopGame();
        this.activeGame = 'snake';

        // UI Setup
        document.getElementById('games-menu').classList.add('hidden');
        document.getElementById('games-play-area').classList.remove('hidden');
        document.getElementById('game-status').innerText = 'Snake: Use setas para mover';

        // Init Game State
        this.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        this.direction = 'right';
        this.spawnFood();
        this.updateScore();

        // Loop
        this.gameLoop = setInterval(() => this.updateSnake(), 100);
    }

    spawnFood() {
        const cols = this.canvas.width / this.gridSize;
        const rows = this.canvas.height / this.gridSize;
        this.food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
    }

    handleSnakeInput(key) {
        switch (key) {
            case 'ArrowUp': if (this.direction !== 'down') this.direction = 'up'; break;
            case 'ArrowDown': if (this.direction !== 'up') this.direction = 'down'; break;
            case 'ArrowLeft': if (this.direction !== 'right') this.direction = 'left'; break;
            case 'ArrowRight': if (this.direction !== 'left') this.direction = 'right'; break;
        }
    }

    updateSnake() {
        if (this.isGameOver) return;

        // Calculate new head
        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check Collisions
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head); // Add Head

        // Check Food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.spawnFood();
        } else {
            this.snake.pop(); // Remove Tail
        }

        this.drawSnake();
    }

    drawSnake() {
        // Clear
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Food
        this.ctx.fillStyle = '#ff4d4f';
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);

        // Snake
        this.ctx.fillStyle = '#52c41a';
        this.snake.forEach(segment => {
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });
    }

    // ==========================================
    // PACMAN (SIMPLIFIED)
    // ==========================================
    startPacman() {
        this.stopGame();
        this.activeGame = 'pacman';

        document.getElementById('games-menu').classList.add('hidden');
        document.getElementById('games-play-area').classList.remove('hidden');
        document.getElementById('game-status').innerText = 'Pac-Man: Coma os pontos!';

        // Init State
        this.pacman = { x: 1, y: 1, dir: 'stop', nextDir: 'stop' };
        this.ghosts = [{ x: 10, y: 10, color: 'red' }, { x: 15, y: 5, color: 'pink' }];

        // Create Simple Maze (1 = Wall, 0 = Dot)
        // 20x15 grid
        this.generatePacmanLevel();
        this.updateScore();

        this.gameLoop = setInterval(() => this.updatePacman(), 150);
    }

    generatePacmanLevel() {
        this.walls = [];
        this.dots = [];
        const cols = 20;
        const rows = 15;

        // Borders
        for (let x = 0; x < cols; x++) { this.walls.push({ x, y: 0 }); this.walls.push({ x, y: rows - 1 }); }
        for (let y = 0; y < rows; y++) { this.walls.push({ x: 0, y }); this.walls.push({ x: cols - 1, y }); }

        // Random obstacles
        for (let i = 0; i < 30; i++) {
            this.walls.push({
                x: Math.floor(Math.random() * (cols - 2)) + 1,
                y: Math.floor(Math.random() * (rows - 2)) + 1
            });
        }

        // Dots everywhere else
        for (let x = 1; x < cols - 1; x++) {
            for (let y = 1; y < rows - 1; y++) {
                if (!this.walls.some(w => w.x === x && w.y === y)) {
                    this.dots.push({ x, y });
                }
            }
        }
    }

    handlePacmanInput(key) {
        switch (key) {
            case 'ArrowUp': this.pacman.nextDir = 'up'; break;
            case 'ArrowDown': this.pacman.nextDir = 'down'; break;
            case 'ArrowLeft': this.pacman.nextDir = 'left'; break;
            case 'ArrowRight': this.pacman.nextDir = 'right'; break;
        }
    }

    updatePacman() {
        if (this.isGameOver) return;

        // Try to move in nextDir
        this.tryMovePacman(this.pacman.nextDir);

        // Move Ghosts (Simple AI: Random)
        this.ghosts.forEach(ghost => {
            const dirs = ['up', 'down', 'left', 'right'];
            const move = dirs[Math.floor(Math.random() * dirs.length)];
            let newX = ghost.x;
            let newY = ghost.y;
            if (move === 'up') newY--;
            if (move === 'down') newY++;
            if (move === 'left') newX--;
            if (move === 'right') newX++;

            if (!this.isWall(newX, newY)) {
                ghost.x = newX;
                ghost.y = newY;
            }

            // Colisão
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                this.gameOver();
            }
        });

        // Eat Dots
        const dotIndex = this.dots.findIndex(d => d.x === this.pacman.x && d.y === this.pacman.y);
        if (dotIndex !== -1) {
            this.dots.splice(dotIndex, 1);
            this.score += 10;
            this.updateScore();
            if (this.dots.length === 0) {
                this.gameOver(true);
            }
        }

        this.drawPacman();
    }

    tryMovePacman(dir) {
        let newX = this.pacman.x;
        let newY = this.pacman.y;

        if (dir === 'up') newY--;
        if (dir === 'down') newY++;
        if (dir === 'left') newX--;
        if (dir === 'right') newX++;

        if (!this.isWall(newX, newY)) {
            this.pacman.x = newX;
            this.pacman.y = newY;
            this.pacman.dir = dir;
        }
    }

    isWall(x, y) {
        return this.walls.some(w => w.x === x && w.y === y);
    }

    drawPacman() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const size = this.gridSize; // reuse snake grid size (20)

        // Walls
        this.ctx.fillStyle = 'blue';
        this.walls.forEach(w => this.ctx.fillRect(w.x * size, w.y * size, size, size));

        // Dots
        this.ctx.fillStyle = 'white';
        this.dots.forEach(d => {
            this.ctx.beginPath();
            this.ctx.arc(d.x * size + size / 2, d.y * size + size / 2, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Player
        this.ctx.fillStyle = 'yellow';
        this.ctx.beginPath();
        this.ctx.arc(this.pacman.x * size + size / 2, this.pacman.y * size + size / 2, size / 2 - 2, 0.2 * Math.PI, 1.8 * Math.PI); // Boca aberta simples
        this.ctx.lineTo(this.pacman.x * size + size / 2, this.pacman.y * size + size / 2);
        this.ctx.fill();

        // Ghosts
        this.ghosts.forEach(g => {
            this.ctx.fillStyle = g.color;
            this.ctx.fillRect(g.x * size + 2, g.y * size + 2, size - 4, size - 4);
        });
    }

    gameOver(win = false) {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = win ? 'green' : 'red';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(win ? 'YOU WIN!' : 'GAME OVER', this.canvas.width / 2, this.canvas.height / 2);

        document.getElementById('game-status').innerText = win ? 'Vitória! Pressione Menu para voltar.' : 'Game Over. Tente novamente.';
    }
}
