/*
     - Made by David Charon-Zade -
            * few notes *
	 - To run the code, Please use LiveServer on the index.html file. 
	 - The logic was written in pure vanilla javaScript, (could do it with React tho). 
	 (if the extension isn't installed, please install via the extensions panel).
	 - The code is devided to sectors:
	      * Globals.
	      * Document Elements.
	      * Canvas Initialization.
		  * Classes.
		  * Animation Handling.
		  * Events.
		  * Spawn Enemies. 
*/

/*
   ---------------------  Globals ------------------------
*/
let animationId;

// Current enemies on canvas
let currEscapes = 0;
let currChasers = 0;
let currRandoms = 0;

// Timers
let escapesSpawn = 5000;
let chasersSpawn = 5000;
let randomsSpawn = 5000;
let cloudSpawn = 10000;
let scoreInterval = 1000;

/*
   ------------------- Documet Elemets ------------------- 
*/

// Select canvas
const canvas = document.querySelector('canvas');

// Select score
const score = document.querySelector('#score');

// Select points
const points = document.querySelector('#points');

// Select fixed div
const fixed = document.querySelector('.fixed');

// header Points
const headerPoints = document.querySelector('h1');

// Select header
const startPanel = document.querySelector('.bg-white-start');
// gameOver Panel
const gameOverPanel = document.querySelector('.bg-white');

// Select header
const button = document.getElementById('start');

/*
  ------------------- Canvas Init ------------------------
*/

// Initialize canvas's boundries
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.7;
canvas.style.backgroundColor = 'lightblue';
canvas.style.marginTop = '1rem';

// Create canvas API
const c = canvas.getContext('2d');

/*
	--------------------  Classes  -----------------------
*/

class GameManager {
	constructor() {}

	deleteAllEnemies() {
		chases.forEach((chase, index) => {
			chase.update();
			chases.splice(index, 1);
		});
		espaces.forEach((escape, index) => {
			escape.update();
			espaces.splice(index, 1);
		});

		randoms.forEach((random, index) => {
			random.update();
			randoms.splice(index, 1);
		});
	}

	initRandomsAngle() {
		this.angle = Math.atan2(
			this.y - Math.random() * (canvas.height * 0.9 - 100) + 100,
			this.x - Math.random() * (canvas.width * 0.9 - 100) + 100
		);
	}

	setRandomPosition() {
		this.x = Math.random() * (canvas.width * 0.9 - 100) + 100;
		this.y = Math.random() * (canvas.height * 0.9 - 100) + 100;
		// console.log(this.x, this.y);
	}

	setRandomRadius() {
		this.radius = Math.random() * (50 - 20) + 20;
	}

	colorPicker() {
		this.color = '#';
		for (let i = 0; i < 6; i++) {
			this.color = this.color + Math.floor(Math.random() * 9).toString();
		}
	}

	setEscapeRadius() {
		this.radius = Math.random() * (80 - 30) + 30;
	}

	setEscapePosition() {
		if (Math.random() < 0.5) {
			this.x =
				Math.random() < 0.5
					? Math.abs(0 - this.radius)
					: Math.abs(player.x + this.radius * 2);
			this.y = Math.random() * player.y + this.radius;
		} else {
			this.x = Math.random() * player.x;
			this.y =
				Math.random() < 0.5
					? Math.abs(0 - this.radius)
					: player.y + 2 * this.radius;
		}
	}

	initEscapeAngle() {
		this.angle = Math.atan2(this.y - player.y, this.x - player.x);
	}

	setChaserRadius() {
		this.radius = Math.random() * (80 - 30) + 30;
	}

	setChaserRecHeightAndHeight() {
		this.recHeight = Math.random() * (50 - 10) + 10;
		this.recWidth = Math.random() * (100 - 10) + 10;
	}

	setChaserPosition() {
		if (Math.random() < 0.5) {
			this.x =
				Math.random() < 0.5
					? Math.abs(0 - this.radius * 2)
					: Math.abs(canvas.width * 0.7 + this.radius);
			this.y = Math.abs(Math.random() * canvas.height * 0.7);
		} else {
			this.x = Math.abs(Math.random() * canvas.width * 0.7);
			this.y =
				Math.random() < 0.5
					? Math.abs(0 - this.radius)
					: Math.abs(canvas.height * 0.7 + this.radius);
		}
	}

	initChaserAngle() {
		this.angle = Math.atan2(player.y - this.y, player.x - this.x);
	}

	setVelocity() {
		this.velocity = {
			x: Math.random() * (Math.cos(this.angle) * 2 + 3) - 3,
			y: Math.random() * (Math.sin(this.angle) * 2 + 1) - 1,
		};
	}
}

// Clouds Class - Visuals

class Clouds {
	constructor() {
		this.x = -100;
		this.y = Math.random() * (canvas.height - 100) + 100;
		this.radius = 30;
		this.color = 'white';
	}

	draw() {
		// specify that you want to start drawing
		c.beginPath();

		// design your upcoming shape
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.arc(this.x + 30, this.y, this.radius, 0, Math.PI * 2, false);
		c.arc(this.x + 60, this.y, this.radius, 0, Math.PI * 2, false);

		// shape style
		c.fillStyle = this.color;

		// finally draw
		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + 1;
	}
}

// Player

class Player {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
	}

	setPositionX(x) {
		this.x = x;
	}
	setPositionY(y) {
		this.y = y;
	}

	getPosition() {
		return { x: this.x, y: this.y };
	}

	draw() {
		// specify that you want to start drawing
		c.beginPath();

		// design your upcoming shape
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

		// shape style
		c.fillStyle = this.color;

		// finally draw
		c.fill();
	}
}

// Enemy

class Enemy {
	constructor(x, y, color, velocity) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.velocity = velocity;
		this.isOnBoundry = false;
	}

	update() {
		this.draw();
		const newX = this.x + this.velocity.x;
		const newY = this.y + this.velocity.y;
		// console.log(newX, newY);
		if (newX > 40 && newX < canvas.width - 15) {
			this.x = this.x + this.velocity.x;
		} else {
			this.isOnBoundry = true;
		}
		if (newY > 20 && newY < canvas.height - 40) {
			this.y = this.y + this.velocity.y;
		} else {
			this.isOnBoundry = true;
		}
	}
}

// Chase

class Chase extends Enemy {
	constructor(x, y, radius, color, velocity, recWidth, recHeight) {
		super(x, y, color, velocity);
		this.recWidth = recWidth;
		this.recHeight = recHeight;
	}

	draw() {
		// specify that you want to start drawing
		c.beginPath();

		// design your upcoming shape
		c.fillRect(this.x, this.y, this.recWidth, this.recHeight);

		// shape style
		c.fillStyle = this.color;

		// finally draw
		c.fill();
	}

	hitTarget() {
		cancelAnimationFrame(animationId);
		manager.deleteAllEnemies();
		headerPoints.textContent = points.textContent;
		fixed.style.display = 'flex';
		startPanel.style.display = 'none';
		gameOverPanel.style.display = 'flex';
	}
}

// Escape

class Escape extends Enemy {
	constructor(x, y, square, color, velocity) {
		super(x, y, color, velocity);
		this.square = square;
	}

	draw() {
		// specify that you want to start drawing
		c.beginPath();

		// design your upcoming shape
		c.fillRect(this.x, this.y, this.square, this.square);

		// shape style
		c.fillStyle = this.color;

		// finally draw
		c.fill();
	}

	hitTarget() {
		points.textContent = parseInt(points.textContent) + 5;
		currEscapes -= 1;
	}
}

// Random

class Random extends Enemy {
	constructor(x, y, radius, color, velocity) {
		super(x, y, color, velocity);
		this.radius = radius;
	}

	draw() {
		// specify that you want to start drawing
		c.beginPath();

		// design your upcoming shape
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

		// shape style
		c.fillStyle = this.color;

		// finally draw
		c.fill();
	}

	hitTarget() {
		cancelAnimationFrame(animationId);
		manager.deleteAllEnemies();
		headerPoints.textContent = points.textContent;
		fixed.style.display = 'flex';
		startPanel.style.display = 'none';
		gameOverPanel.style.display = 'flex';
	}
}

/*
	------------- Initializations ---------------
*/

// Elements Arrays
const espaces = [];
const chases = [];
const randoms = [];

// Visuals
const clouds = [];

// instances initializing
const player = new Player(canvas.width / 2, canvas.height / 2, 30, 'tomato');
let manager = new GameManager();

/*
 ---------------- Animation handler ------------------
 */

const cloud = new Clouds();

function animate() {
	// Request animation
	animationId = requestAnimationFrame(animate);

	// clear the canvas before each frame
	c.clearRect(0, 0, canvas.width, canvas.height);

	// draw the player (mouse) after each frame
	player.draw();

	// update the position of each cloud
	clouds.forEach((cloud) => {
		cloud.update();
	});

	// update the position of each chaser
	chases.forEach((chase, index) => {
		if (chase.isOnBoundry) {
			manager.x = chase.x;
			manager.y = chase.y;
			manager.initChaserAngle();
			manager.setVelocity();
			chase.velocity = manager.velocity;
			chase.isOnBoundry = false;
		}
		chase.update();
		const dist1 = Math.hypot(
			player.getPosition().x - chase.x,
			player.getPosition().y - chase.y
		);

		if (dist1 - player.radius * 2 < 1) {
			setTimeout(() => {
				// Game Over!
				chase.hitTarget();
			}, 0);
		}
	});

	// update the position of each escape
	espaces.forEach((escape, index) => {
		escape.update();
		const dist2 = Math.hypot(player.x - escape.x, player.y - escape.y);

		if (dist2 - player.radius < 10) {
			setTimeout(() => {
				espaces.splice(index, 1);
				escape.hitTarget();
			}, 0);
		}
	});

	// update the position of each random
	randoms.forEach((random, index) => {
		if (random.isOnBoundry) {
			manager.initRandomsAngle();
			manager.setVelocity();
			random.velocity = manager.velocity;
			random.isOnBoundry = false;
		}
		random.update();

		const dist3 = Math.hypot(player.x - random.x, player.y - random.y);

		if (dist3 - random.radius - player.radius < 1) {
			setTimeout(() => {
				// Game Over!

				random.hitTarget();
			}, 0);
		}
	});
}

/*
 ---------------------- Events -----------------------
 */
window.addEventListener('mousemove', (event) => {
	const x = event.clientX;
	const y = event.clientY;
	if (x > 0 && x < canvas.width) {
		player.setPositionX(x);
	}
	if (y > 0 && y < canvas.height) {
		player.setPositionY(y);
	}
});

/*
	 ---------------------- Spawn Enemies -----------------------
*/

function spawnChasers() {
	let maxEnemies = 10;

	let interval = setInterval(() => {
		currChasers += 1;

		manager.setChaserRadius();
		manager.setChaserRecHeightAndHeight();
		manager.setChaserPosition();
		manager.initChaserAngle();
		manager.setVelocity();
		manager.colorPicker();

		// rectangle
		chases.push(
			new Chase(
				manager.x,
				manager.y,
				manager.radius,
				manager.color,
				manager.velocity,
				manager.recWidth,
				manager.recHeight
			)
		);

		if (currChasers === maxEnemies) {
			clearInterval(interval);
		}
	}, chasersSpawn);
}
function spawnEscapes() {
	let maxEnemies = 10;

	let interval = setInterval(() => {
		currEscapes += 1;
		manager.setEscapeRadius();
		manager.setEscapePosition();
		manager.initEscapeAngle();
		manager.setVelocity();
		manager.colorPicker();

		espaces.push(
			new Escape(
				manager.x,
				manager.y,
				manager.radius,
				manager.color,
				manager.velocity
			)
		);

		if (currEscapes === maxEnemies) {
			clearInterval(interval);
		}
	}, escapesSpawn);
}

function spawnRandoms() {
	let maxEnemies = 10;

	let interval = setInterval(() => {
		currRandoms += 1;
		manager.setRandomRadius();
		manager.setRandomPosition();
		manager.initRandomsAngle();
		manager.setVelocity();
		manager.colorPicker();

		// circle
		randoms.push(
			new Random(
				manager.x,
				manager.y,
				manager.radius,
				manager.color,
				manager.velocity
			)
		);

		if (currRandoms === maxEnemies) {
			clearInterval(interval);
		}
	}, randomsSpawn);
}

function spawnClouds() {
	let interval = setInterval(() => {
		// circle
		manager.initRandomsAngle();
		manager.setVelocity();
		clouds.push(new Clouds(1));
	}, cloudSpawn);
}

function startScore() {
	let interval = setInterval(() => {
		// update the score:
		score.textContent = parseInt(score.textContent) + 1;
	}, scoreInterval);
}

function restartGame() {
	location.reload();
}

function startGame() {
	fixed.style.display = 'none';
	// for animation

	animate();

	// for the score
	startScore();

	// for the spawning of the clouds
	spawnClouds();

	// for the spawning of the chasers
	spawnChasers();

	// for the spawning of the escapers
	spawnEscapes();

	// for the spawning of the randoms
	spawnRandoms();
}
