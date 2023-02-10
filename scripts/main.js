var titlePage = document.getElementById('titlePage');
var title = document.getElementById('title');
var table = document.getElementById('table');
var ball = document.getElementById('ball');
var paddle1 = document.getElementById('paddle1');
var paddle2 = document.getElementById('paddle2');
var player1ScoreElement = document.getElementById('player1Score');
var player2ScoreElement = document.getElementById('player2Score');
var countdownElement = document.getElementById('countdown');
var errorElement = document.getElementById('error');

// Get the table dimensions.
var tableHeight = parseInt(window.getComputedStyle(table).height, 10);
var tableWidth = parseInt(window.getComputedStyle(table).width, 10);

// Get the paddles current position.
var paddle1Top = parseInt(window.getComputedStyle(paddle1).top, 10);
var paddle1Left = parseInt(window.getComputedStyle(paddle1).left, 10);
var paddle1Height = parseInt(window.getComputedStyle(paddle1).height, 10);
var paddle1Width = parseInt(window.getComputedStyle(paddle1).width, 10);

var paddle2Top = parseInt(window.getComputedStyle(paddle2).top, 10);
var paddle2Left = parseInt(window.getComputedStyle(paddle2).left, 10);
var paddle2Height = parseInt(window.getComputedStyle(paddle2).height, 10);
var paddle2Width = parseInt(window.getComputedStyle(paddle2).width, 10);

// Get the balls current position.
var ballTop = parseInt(window.getComputedStyle(ball).top, 10);
var ballHeight = parseInt(window.getComputedStyle(ball).height, 10);
var ballLeft = parseInt(window.getComputedStyle(ball).left, 10);
var ballWidth = parseInt(window.getComputedStyle(ball).width, 10);

// Set inital conditions
var player1Score = 0;
var player2Score = 0;
var verticalSpeed = 0;
var horizontalSpeed = 0;
var speed = 0;

const players = {
    HUMAN: 'human',
    PRACTICE: 'practice',
    EVIL: 'evil'
}
var player2 = players.PRACTICE;

var wPressed = false;
var sPressed = false;
var upPressed = false;
var downPressed = false;

var frame;
function setInitialConditions() {
	// Set ball position
	ballTop = ((tableHeight + ballHeight) / 2);
	ballLeft = ((tableWidth + ballWidth) / 2);

	// Set the speeds
	verticalSpeed = 2 * Math.random() - 1;
	horizontalSpeed = 2 * Math.random() - 1;
	if (horizontalSpeed < 0) {
		horizontalSpeed = Math.min(horizontalSpeed, -0.5);
	}
	if (horizontalSpeed > 0) {
		horizontalSpeed = Math.max(horizontalSpeed, 0.5);
	}
	normalizeSpeeds();
	
	speed = Math.ceil(tableWidth / 256);
}

function normalizeSpeeds() {
	var norm = Math.sqrt(horizontalSpeed**2 + verticalSpeed**2);
	horizontalSpeed /= norm;
	verticalSpeed /= norm;
}

document.addEventListener('keydown', function(event){
	if (event.isComposing || event.keyCode === 229) {
		return;
	}
	
	// W pressed -> Paddle 1 moves up
	wPressed = event.keyCode === 87;

	// S pressed -> Paddle 1 moves down
	sPressed = event.keyCode === 83;

	// Up pressed -> Paddle 2 moves up
	upPressed = event.keyCode === 38;

	// Down pressed -> Paddle 2 moves down
	downPressed = event.keyCode === 40;
});

document.addEventListener('keyup', function(event){
	if (event.isComposing || event.keyCode === 229) {
		return;
	}
	
	// W pressed -> Paddle 1 moves up
	if (event.keyCode === 87) {
		wPressed = false;
	}	

	// S pressed -> Paddle 1 moves down
	if (event.keyCode === 83) {
		sPressed = false;
	}

	// Up pressed -> Paddle 2 moves up
	if (event.keyCode === 38) {
		upPressed = false;
	}

	// Down pressed -> Paddle 2 moves down
	if (event.keyCode === 40) {
		downPressed = false;
	}
});

const portrait = window.matchMedia("(orientation: portrait)");
portrait.addEventListener("change", function(e) {
    start();
})

window.addEventListener('resize', () => {
	start();
}, { passive: true });

document.addEventListener('DOMContentLoaded', function(event){
	start();
});

function start() {

	// Check if the device is portrait or landscape.
	if (portrait.matches) {
		window.cancelAnimationFrame(frame);
		errorElement.classList.remove('hidden');
		return;
	}
	errorElement.classList.add('hidden');

	title.classList.add('visible');

	setInitialConditions();

	setTimeout(function (){
		titlePage.classList.add('hidden');

		setTimeout(function (){
			var countdown = 3;
			countdownElement.innerHTML = countdown;

			var countdownTimer = setInterval(function (){
				countdown--;

				if (countdown === 0) {
					clearInterval(countdownTimer);

					countdownElement.innerHTML = '';
					countdownElement.style.zIndex = -1;

					// Start the game
					frame = window.requestAnimationFrame(generateNextFrame);
				}
				else {
					countdownElement.innerHTML = countdown;
				}
			}, 1000);
		}, 2000);
	}, 2500);
}

function generateNextFrame() {
	var newBallTop = ballTop + (verticalSpeed * speed);
	var newBallLeft = ballLeft + (horizontalSpeed * speed);
	var newBallRight = newBallLeft + ballWidth;
	var newBallBottom = newBallTop + ballHeight;
	
	var isCurrentBallHittingPaddle1Right = ballLeft < paddle1Left + paddle1Width;
	var isCurrentBallHittingPaddle1Top = ballTop + ballHeight > paddle1Top;
	var isCurrentBallHittingPaddle1Bottom = ballTop < paddle1Top + paddle1Height;
	var isCurrentBallHittingPaddle2Left = ballLeft + ballWidth > paddle2Left;
	var isCurrentBallHittingPaddle2Top = ballTop + ballHeight > paddle2Top;
	var isCurrentBallHittingPaddle2Bottom = ballTop < paddle2Top + paddle2Height;

	var isNewBallHittingPaddle1Right = newBallLeft < paddle1Left + paddle1Width && newBallBottom > paddle1Top && newBallTop < paddle1Top + paddle1Height;
	var isNewBallHittingPaddle1Top = isNewBallHittingPaddle1Right && !isCurrentBallHittingPaddle1Top && newBallBottom > paddle1Top;
	var isNewBallHittingPaddle1Bottom = isNewBallHittingPaddle1Right && !isCurrentBallHittingPaddle1Bottom && newBallTop < paddle1Top + paddle1Height;
	var isNewBallHittingPaddle2Left = newBallRight > paddle2Left && newBallBottom > paddle2Top && newBallTop < paddle2Top + paddle2Height;
	var isNewBallHittingPaddle2Top = isNewBallHittingPaddle2Left && !isCurrentBallHittingPaddle2Top && newBallBottom > paddle2Top;
	var isNewBallHittingPaddle2Bottom = isNewBallHittingPaddle2Left && !isCurrentBallHittingPaddle2Bottom && newBallTop < paddle2Top + paddle2Height;

	// Bounces off the top or bottom
	if (newBallTop < 0 || newBallBottom > tableHeight) {
		verticalSpeed *= -1.0;
	}

	// Bounces off the top or bottom of the paddle
	if (isNewBallHittingPaddle1Top || isNewBallHittingPaddle1Bottom || isNewBallHittingPaddle2Top || isNewBallHittingPaddle2Bottom) {
		verticalSpeed *= -1.0;
		speed += Math.ceil(tableWidth / 1024);
	}

	// Goal scored
	if (newBallLeft < 0 || newBallRight > tableWidth) {
		// Increment the scores
		if (newBallLeft < 0) {
			player2Score++;
			player2ScoreElement.innerHTML = player2Score;
		}
		else if (newBallRight > tableWidth) {
			player1Score++;
			player1ScoreElement.innerHTML = player1Score;
		}

		setInitialConditions();
		frame = window.requestAnimationFrame(generateNextFrame);
		return;
	}

	// Bounces off the left or right paddle
	if ((!isCurrentBallHittingPaddle1Right && isNewBallHittingPaddle1Right) || (!isCurrentBallHittingPaddle2Left && isNewBallHittingPaddle2Left)) {

		// Find the position on the paddle the ball hit
		if (!isCurrentBallHittingPaddle1Right && isNewBallHittingPaddle1Right) {
			verticalSpeed = 2 * ((ballTop + (ballHeight / 2) - paddle1Top) / (paddle1Height)) - 1;
		}

		if (!isCurrentBallHittingPaddle2Left && isNewBallHittingPaddle2Left) {
			verticalSpeed = 2 * ((ballTop + (ballHeight / 2) - paddle2Top) / (paddle2Height)) - 1;
		}

		horizontalSpeed *= -1.0;
		speed += Math.ceil(tableWidth / 1024);

		normalizeSpeeds();
	}

	// Update the balls position
	ballTop = ballTop + (verticalSpeed * speed);
	ballLeft = ballLeft + (horizontalSpeed * speed);

	// Move the ball
	ball.style.top = ballTop + 'px';
	ball.style.left = ballLeft + 'px';

	// Move the paddles
	if (wPressed) {
		paddle1Top = Math.max(paddle1Top - Math.ceil(tableWidth / 64), 50);
		paddle1.style.top = paddle1Top + 'px';
	}

	if (sPressed) {
		paddle1Top = Math.min(paddle1Top + Math.ceil(tableWidth / 64), tableHeight - paddle1Height - 50);
		paddle1.style.top = paddle1Top + 'px';
	}

	if (player2 === players.HUMAN) {
		if (upPressed) {
			paddle2Top = Math.max(paddle2Top - Math.ceil(tableWidth / 64), 50);
			paddle2.style.top = paddle2Top + 'px';
		}
	
		if (downPressed) {
			paddle2Top = Math.min(paddle2Top + Math.ceil(tableWidth / 64), tableHeight - paddle2Height - 50);
			paddle2.style.top = paddle2Top + 'px';
		}
	}
	else if (player2 === players.PRACTICE) {
		paddle2Top = Math.min(Math.max((ballTop + ballHeight / 2) - paddle2Height / 2, 50), tableHeight - paddle2Height - 50);
		paddle2.style.top = paddle2Top + 'px';
	}
	else if (player2 === players.EVIL) {
		var topGoalTop = ballHeight / 2;
		var bottomGoalTop = tableHeight - (ballHeight / 2);
		var goalRight = paddle1Left + paddle1Width;
		var ballMiddle = ballTop + ballHeight;

		// Ratio to hit the top goal
		var topGoalRatio = Math.abs(horizontalSpeed) * (topGoalTop - ballMiddle) / (paddle2Left - (ballWidth / 2) - goalRight);
		// Ratio to hit the bottom goal
		var bottomGoalRatio = Math.abs(horizontalSpeed) * (bottomGoalTop - ballMiddle) / (paddle2Left - (ballWidth / 2) - goalRight);

		// Take whichever shot is easiest
		if (Math.abs(topGoalRatio) < Math.abs(bottomGoalRatio)) {
			paddle2Top = (ballTop + (ballHeight / 2)) - ((paddle2Height * (topGoalRatio + 1)) / 2);
		}
		else {
			paddle2Top = (ballTop + (ballHeight / 2)) - ((paddle2Height * (bottomGoalRatio + 1)) / 2);
		}

		paddle2Top = Math.min(Math.max(paddle2Top, 50), tableHeight - paddle2Height - 50);
		paddle2.style.top = paddle2Top + 'px';
	}

	frame = window.requestAnimationFrame(generateNextFrame);
}