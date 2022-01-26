'use strict'

function buildBoard() {
    var size = gLevel.size;
    var board = [];


    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            var cell = { //maybe add i, j
                i: i,
                j: j,
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }
    board = setMinesNegsCount(board)
    return board;
}

//set mines, and count them for each cell
function setMinesNegsCount(board) {
    //put mines randomaly on MODEL
    for (var i = 0; i < gLevel.mines; i++) {
        var idx = getRandomInt(0, gLevel.size)
        var jdx = getRandomInt(0, gLevel.size)
        while (board[idx][jdx].isMine) {
            idx = getRandomInt(0, gLevel.size)
            jdx = getRandomInt(0, gLevel.size)
        }
        board[idx][jdx].isMine = true;
    }

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
    for (var i = 0; i < size; i++) {
        board.push([]);
        board1.push([]);
        for (var j = 0; j < size; j++) {
            // board[i][j] = '' + i + ' , ' + j;
            board[i][j] = gBoard[i][j]
            board1[i][j] = gBoard[i][j].isMine
        }
    }
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