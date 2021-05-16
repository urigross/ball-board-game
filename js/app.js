var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GLUE = 'GLUE';
var GAMER = 'GAMER';
var intervalId;
var intervalId2;
var intervalId3;


var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src ="img/candy.png" />';
var gBoard;
var gCurrentBallsCount;
var gTotalBallsCollected;
var gBallTimer = 2 * 1000;
var gIsWin;
// Game sounds
var gameMusic = new Audio('wav/play-with-me.mp3');
var clickSound = new Audio('wav/click.wav');
var winSound = new Audio('https://opengameart.org/sites/default/files/Win%20sound.mp3');
var squish = new Audio('wav/squish.mp3');
// Board Central Positions
var gICenterCell;
var gJCenterCell;
var gIsUserGlued = false;
var gIsGlueOnDOM = false;

function init() {
    gameMusic.play();
    gIsWin = false;
    gCurrentBallsCount = 0;
    gTotalBallsCollected = 0;
    gameMusic.volume = 0.3;
    printCounter(); //DOM
    gGamerPos = { i: 2, j: 9 };
    gBoard = buildBoard();
    renderBoard(gBoard);
    placeNewBall(); // First Time run
    placeNewGlue();
    intervalId = setInterval(placeNewBall, gBallTimer);
    intervalId3 = setInterval(placeNewGlue, gBallTimer);



}
// create and place in model and DOM
function placeNewBall() {
    var availablePos = getAvailablePos();
    createBall(availablePos); // MODEL
    renderCell(availablePos, BALL_IMG); // DOM 
}

// create and place in model and DOM
function placeNewGlue() {
    if (gIsGlueOnDOM) return;
    var availablePos = getAvailablePos();
    createGlue(availablePos); // MODEL
    renderCell(availablePos, GLUE_IMG); // DOM 
    //remove glue
    setTimeout(removeItem, 3 * 1000, availablePos); //remove glue after 3 sec from board model\
    // if gamer is not on glue - remove from DOM the glue image after 3 sec
    if (!gIsUserGlued) { setTimeout(removeGlueDOM, 3 * 1000, availablePos, ''); };


}





function getAvailablePos() {
    var posFound = false;
    while (!posFound)
    //Place the Balls(currently randomly chosen positions)
    {
        var currentAvailablePos = { i, j }; // Create new obj every time
        var i = getRandomIntInclusive(1, gBoard.length - 2);
        var j = getRandomIntInclusive(1, gBoard[0].length - 2);
        var currentBoardPos = gBoard[i][j];

        if (currentBoardPos.type === 'FLOOR' &&
            currentBoardPos.gameElement === null) {
            currentAvailablePos.i = i;
            currentAvailablePos.j = j;
            return currentAvailablePos;
        }
    }
}

function buildBoard() {
    // Create the Matrix
    var board = createMat(10, 12);
    gICenterCell = Math.round(board.length / 2); // Finds the center cell height in board.
    gJCenterCell = Math.round(board[0].length / 2); // Finds the center cell width in board.
    // Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            // Put FLOOR in a regular cell
            var cell = { type: FLOOR, gameElement: null };

            // Place Walls at edges
            if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
                // Place walls exclude board edge centers
                if (i !== gICenterCell && j !== gJCenterCell) cell.type = WALL;
            }

            // Add created cell to The game board
            board[i][j] = cell;
        }
    }
    // Place the gamer at selected position
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    return board;
}

// in Model
function createBall(pos) {
    var ballIPos = pos.i;
    var ballJPos = pos.j;
    gBoard[ballIPos][ballJPos].gameElement = BALL; // change in model
    gCurrentBallsCount++;
    if (gCurrentBallsCount === 80) {
        clearInterval(intervalId); // stop when no more place
        console.log('no more space');
        openModal();
        printLoseModal();
    }
}

// in Model
function createGlue(pos) {
    var glueIpos = pos.i;
    var glueJPos = pos.j;
    gBoard[glueIpos][glueJPos].gameElement = GLUE;
}

function removeItem(pos) {
    gBoard[pos.i][pos.j].gameElement = null;

}



// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })

            // TODO - change to short if statement
            if (currCell.type === FLOOR) cellClass += ' floor';
            else if (currCell.type === WALL) cellClass += ' wall';

            //TODO - Change To template string
            strHTML += '\t<td class="cell ' + cellClass +
                '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

            // TODO - change to switch case statement
            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG;
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function win() {
    gIsWin = true;
    clearInterval(intervalId); // Win !! 
    winSound.play();
    openModal(); //win greet.
    printWinModal();
}

// Move the player to a specific location
function moveTo(i, j) {
    if (gIsWin || gIsUserGlued) return; // if it's a win - stop moving
    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;
    // Calculate distance to make sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);
    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) ||
        (gGamerPos.i === 0 || gGamerPos.i === gBoard.length - 1 ||
            gGamerPos.j === 0 || gGamerPos.j === gBoard[0].length - 1)) {
        ///// Action: Collecting the ball
        if (targetCell.gameElement === BALL) {
            gTotalBallsCollected++;
            clickSound.play();
            printCounter(); //DOM
            gCurrentBallsCount--;
            if (gCurrentBallsCount === 0) win();
        }
        //  Abction: Step on Glue
        if (targetCell.gameElement === GLUE) {
            gIsUserGlued = true;
            squish.play();
            setTimeout(function() { gIsUserGlued = false; }, 3000);
        }




        if (gCurrentBallsCount === 82) {
            intervalId2 = setTimeout(setInterval(placeNewBall, gBallTimer), gBallTimer); // if all board was full and then you start eating - continue game
        }
        // MOVING from current position
        // Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
        // Dom:
        renderCell(gGamerPos, '');

        // MOVING to selected position
        // Model:
        gGamerPos.i = i;
        gGamerPos.j = j;
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
        // DOM:
        renderCell(gGamerPos, GAMER_IMG);

    } // else console.log('TOO FAR', iAbsDiff, jAbsDiff);
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

function removeGlueDOM(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
    gIsGlueOnDOM = false;
}

// Move the player by keyboard arrows
function handleKey(event) {
    var i = gGamerPos.i;
    var j = gGamerPos.j;


    switch (event.key) {
        case 'ArrowLeft':
            if (i === gICenterCell && j === 0) moveTo(i, gBoard[0].length - 1);
            else { moveTo(i, j - 1); };
            break;
        case 'ArrowRight':
            if (i === gICenterCell && j === gBoard[0].length - 1) moveTo(i, 0);
            else { moveTo(i, j + 1) };
            break;
        case 'ArrowUp':
            if (i === 0 && j === gJCenterCell) moveTo(gBoard.length - 1, gJCenterCell);
            else { moveTo(i - 1, j) };
            break;
        case 'ArrowDown':
            if (i === gBoard.length - 1 && j === gJCenterCell) moveTo(0, gJCenterCell);
            else { moveTo(i + 1, j) };
            break;
    }

}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function printCounter() {
    var elCount = document.querySelector('.counter');
    elCount.innerText = `Balls Collected:` + gTotalBallsCollected;
}

function printWinModal() {
    var elModalH1 = document.querySelector('.modal-header h1');
    elModalH1.innerText = 'You Won !!! Total Balls colleted: ' + gTotalBallsCollected;
}

function printLoseModal() {
    var elModalH1 = document.querySelector('.modal-header h1');
    elModalH1.innerText = 'Get all balls next Time! Total Balls collected: ' + gTotalBallsCollected;
}


// Get the modal
function modal() {
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
}

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal

// open the modal 
function openModal() {
    var eModal = document.querySelector('.modal');
    eModal.style.display = "block";
}

function closeModal() {
    var eModal = document.querySelector('.modal');
    eModal.style.display = "none";
}

//////////////////// Events
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function restart() {
    closeModal();
    init();
}