'use strict'

function buildBoard() {
    var size = gLevel.size;
    var board = [];


    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            var cell = { //maybe add i, j
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }
    board = setMines(board)
    board = allNegsCount(board)
    return board;
}

function setMines(board = gBoard) {
    //put mines randomaly on MODEL
    if (!gGame.isManualMines) {
        for (var i = 0; i < gLevel.mines; i++) {
            var idx = getRandomInt(0, gLevel.size)
            var jdx = getRandomInt(0, gLevel.size)
            while (board[idx][jdx].isMine) {
                idx = getRandomInt(0, gLevel.size)
                jdx = getRandomInt(0, gLevel.size)
            }
            board[idx][jdx].isMine = true;
            //array for saving mines indexes
            gMines.push({ i: idx, j: jdx })
        }
    } else {
        //realese the mines from model
        for (var i = 0; i < gLevel.mines; i++) {
            var oldMine = gMines.pop();

            gBoard[oldMine.i][oldMine.j].isMine = false

            //maybe delete this
            // gBoard[oldMine.i][oldMine.j].minesAroundCount = howManyMinesAround(gBoard, oldMine.i, oldMine.j)

        }
    }
    return board;
}

function sevenBoom() {
    if (!gGame.isSevenBoom && gGame.shownCount === 0) {
        gGame.isSevenBoom = true;
        for (var i = 0; i < gLevel.size; i++) {
            for (var j = 0; j < gLevel.size; j++) {
                var cell = gBoard[i][j];
                if (isSevenBoom(4 * i + j + 1)) {
                    if (cell.isMine) continue;
                    //old mine ({ i: i, j: j })
                    var oldMineIndexs = gMines[0]
                    gBoard[oldMineIndexs.i][oldMineIndexs.j].isMine = false;
                    //new mine
                    gMines.splice(0, 1)
                    console.log(gMines)
                    cell.isMine = true
                    gMines.push({ i: i, j: j })
                }
            }
        }
        allNegsCount(gBoard);
        matrixConsolePrint()
    }
    return;
}

//check if divide by seven or contain seven (TODO try recurssion)
function isSevenBoom(num) {
    // console.log(num)
    if (num % 7 === 0) return true;
    //try 
    // if (num > 10) isSevenBoom(parseInt(num / 10))
    // else return false;
    while (num >= 7) {
        var lastDigit = num % 10;
        num = parseInt(num / 10);
        if (lastDigit === 7) return true
    }
    console.log(parseInt(num / 10))
    return false
}

function setManualMines(elMan) {
    //todo canel button
    // if (!gGame.isManualMines && gMines.length > 0) {
    if (!gGame.isManualMines) {
        if (gGame.shownCount === 0) {
            gGame.isManualMines = true;
            setMines(gBoard);
        }
        console.log('check')
        return;
    }
    return;
    //maybe false
}

//set mines, and count them for each cell
function allNegsCount(board) {

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = howManyMinesAround(board, i, j)
            }
        }
    }
    return board;
}

//count mines nighbors of model! (ASK: can do with gBoard? but gBoard is still in creating)
function howManyMinesAround(board, idx, jdx) {
    var minesCount = 0

    for (var i = idx - 1; i <= idx + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;
        for (var j = jdx - 1; j <= jdx + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue;
            if (i === idx && j === jdx) continue;
            if (board[i][j].isMine) {
                minesCount++;
            }
        }
    }
    //ASK: is it ok to return number / string?
    return (minesCount > 0 ? minesCount : null)
}


function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            // console.log(cell)
            var className = 'cell cell-' + i + '-' + j;
            strHTML += `<td class="${className}" onmouseup="cellClicked(this, ${i}, ${j})">  </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}


// location such as: {i: 2, j: 7}
function renderCell(i, j, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell-${i}-${j}`);
    elCell.innerHTML = value;
}

//func for check things
function matrixConsolePrint() {
    var size = gLevel.size;
    var board = [];
    var board1 = [];
    var board2 = []
    for (var i = 0; i < size; i++) {
        board.push([]);
        board1.push([]);
        board2.push([]);
        for (var j = 0; j < size; j++) {
            board[i][j] = gBoard[i][j].minesAroundCount
            board1[i][j] = gBoard[i][j].isMine
            board2[i][j] = (4 * i + j + 1)
        }
    }
    console.table(board2)
    console.table(board1)
    console.table(board)
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}