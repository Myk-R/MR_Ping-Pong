const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// sound effects
const hitSound = new Audio('sounds/hitSound.wav');
const scoreSound = new Audio('sounds/scoreSound.wav');
const wallHitSound = new Audio('sounds/wallHitSound.wav');
const party = new Audio('sounds/party.wav');
const sadparty = new Audio('sounds/sadparty.wav');

const netWidth = 5;
const netHeight = canvas.height;

const paddleWidth = 14;
const paddleHeight = 100;

const goalColour = "#00ff5e85";

let upArrowPressed = false;
let downArrowPressed = false;

/* objects */
// net
const net = {
    x: canvas.width/2 - netWidth/2,
    y: 0,
    width: netWidth,
    height: netHeight,
    color: "#4c00ff"
};

// user paddle
const user = {
    x: 10,
    y: canvas.height/2 - paddleHeight/2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#00eeff",
    score: 0
};

// ai paddle
const ai = {
    x: canvas.width - (paddleWidth + 10),
    y: canvas.height/2 - paddleHeight/2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#ff0000",
    score: 0
};

// ball
const ball = {
    x: canvas.width/2,
    y: canvas.height/2,
    radius: 9,
    speed: 6,
    velocityX: 5,
    velocityY: 5,
    color: "#00ff66"
};

/* drawing functions */
// drawing border function
function drawBorder() {
    ctx.beginPath();
    ctx.lineWidth = "8";
    ctx.strokeStyle = "#000599";
    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.closePath();
    ctx.stroke();
}

// drawing goal ends
function drawGoals() {
    // left side
    ctx.fillStyle = goalColour;
    ctx.fillRect(0,0,15,canvas.height);

    // right side
    ctx.fillStyle = goalColour;
    ctx.fillRect(canvas.width - 15,0,15,canvas.height);
}

// drawing net function
function drawNet() {
    ctx.fillStyle = net.color;
    ctx.fillRect(net.x,net.y,net.width,net.height);

    // net ring
    ctx.beginPath();
    ctx.lineWidth = "3";
    ctx.strokeStyle = net.color;
    ctx.arc(net.x,canvas.height/2,100,0,Math.PI*2);
    ctx.closePath();
    ctx.stroke();
}

// drawing score function
function drawScore(x,y,score) {
    ctx.fillStyle = "#f7e8ff";
    ctx.font = '34px monospace';
    ctx.fillText(score, x, y);
}

// drawing paddle function
function drawPaddle(x,y,width,height,color) {
    ctx.fillStyle = color;
    ctx.fillRect(x,y,width,height);
}

// drawing ball function
function drawBall(x,y,radius,color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,radius,0,Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
}

function render() {
    // set style
    ctx.fillStyle = "#0e0024";
    // draws backgound board
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawGoals();
    drawNet(); //drawing net
    drawBorder(); // draws border
    drawScore(canvas.width/4,canvas.height/6,user.score); //drawing user score
    drawScore(3*canvas.width/4, canvas.height/6, ai.score); //drawing ai score
    drawPaddle(user.x,user.y,user.width,user.height,user.color); //drawing user paddle
    drawPaddle(ai.x,ai.y,ai.width,ai.height,ai.color); //drawing ai paddle
    drawBall(ball.x,ball.y,ball.radius,ball.color); //drawing ball
}

/* moving paddles */
// add an eventListener to browser window
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

// activated when key pressed
function keyDownHandler(evnt) {
    // get keyCode
    switch (evnt.keyCode) {

        case 38: // up arrow
            upArrowPressed = true;
            break;

        case 40: // down arrow
            downArrowPressed = true;
            break;
    }
}

// activated when release key
function keyUpHandler(evnt) {
    switch (evnt.keyCode) {

        case 38: // up arrow
            upArrowPressed = false;
            break;

        case 40: // down arrow
            downArrowPressed = false;
            break;
    }
}

// reset ball
function reset() {

    // reset position to centre
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.speed = 6;

    // change direction of ball
    ball.velocityX = -ball.velocityX;
    ball.velocityY = -ball.velocityY;
}

// collision detection function
function collisionDetection(player, ball) {
    player.top = player.y;
    player.right = player.x + player.width;
    player.bottom = player.y + player.height;
    player.left = player.x;

    ball.top = ball.y - ball.radius;
    ball.right = ball.x + ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;

    // returns true or false
    return ball.left < player.right && ball.top < player.bottom && ball.right > player.left && ball.bottom > player.top;
}

// updating screen function
function update() {
    //move the paddle
    if (upArrowPressed && user.y > 5) {
        user.y -= 8;
    } else if (downArrowPressed && (user.y < canvas.height - user.height - 5)) {
        user.y += 8;
    }

    //check if ball hits top or bottom
    if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
        wallHitSound.play();
        ball.velocityY = -ball.velocityY
    }

    // if ball hits right wall
    if (ball.x + ball.radius >= canvas.width - 10) {
        scoreSound.play()
        user.score += 1;
        reset();
        pointMessage("User");
    }

    // if ball hits left wall
    if (ball.x - ball.radius <= 10) {
        scoreSound.play()
        ai.score += 1;
        reset();
        pointMessage("Ai");
    }

    //move the ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    //ai paddle movement
    ai.y += ((ball.y - (ai.y + ai.height/2))) * 0.08;

    //collision detection on paddles
    let player = (ball.x < canvas.width/2) ? user : ai;

    if (collisionDetection(player, ball)) {
        hitSound.play();

        // default angle is 0deg in Radian
        let angle = 0;

        // if ball hit the top of paddle
        if (ball.y < (player.y + player.height/2)) {
            angle = -1 * Math.PI/4; // -45deg
        } else if (ball.y > (player.y + player.height/2)) {
            // if hit bottom of paddle
            angle = Math.PI/4; // 45deg
        }

        // change velocity of ball according to paddle hit
        ball.velocityX = (player == user ? 1 : -1) * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);

        // increase ball speed
        ball.speed += 0.2;
    }
}

// Point message function
function pointMessage(scorer) {
    alert(scorer+" has scored!");
    upArrowPressed = false;
    downArrowPressed = false;
}

// ending function
function ending() {
    if (user.score == 20 || ai.score == 20) {
        clearInterval(game);
        winner = user.score > ai.score ? "User" : "Ai";
        
        ctx.fillStyle = "white";
        ctx.fillRect(canvas.width/2 - 200,2*canvas.height/3 - 60, 400, 80)

        ctx.fillStyle = "black";
        ctx.font = 'oblique bold 50px monospace';

        var message = winner+" wins!";
        ctx.fillText(message, canvas.width/2 - ctx.measureText(message).width/2,2*canvas.height/3);

        winner == "User" ? party.play() : sadparty.play();
    }
}

// game loop
function gameLoop() {
    update();
    render();
    ending();
}

let game = setInterval(gameLoop,1000/60);