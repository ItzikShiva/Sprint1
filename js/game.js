'use strict';

/* const WALL = '#';
const FOOD = '.';
const SUPER_FOOD = '$' */
const FLAG = '🚩'
const MINE = '💣'

//defualt level
var gGameInterval;
// var gMarked = 0;
// var gShown = 0;
var gLevel = {
    size: 4,
    mines: 2
}
var gBoard;
var gGame = {
    isOn: false,
    score: 0,
    shownCount: 0,
    markedCount: 0, //How many cells are marked (with a flag)
    secsPassed: 0
};

function init(size, mines) {
    //reset values
    clearInterval(gGameInterval)
    gLevel.size = size;
    gLevel.mines = mines;
    gGame.isOn = true;
    gGame.score = 0;
    gGame.shownCount = 0;
    gGame.markedCount = 0
    gGame.secsPassed = 0

    var elH2 = document.querySelector('h2')
    elH2.innerText = 0.0


    gBoard = buildBoard(); //[][] - {i:, j:, value:}
    renderBoard(gBoard, '.board-container');
    matrixConsolePrint()

}

function counter() {
    var elH2 = document.querySelector('h2')
    var startTime = Date.now();

    if (gGame.shownCount === 0) {
        gGameInterval = setInterval(function() {
            elH2.innerText = (Date.now() - startTime) / 1000
        }, 100);
    }
}

function cellClicked(elCell, i, j) {
    counter()

    var cell = gBoard[i][j]

    // left 1, right 3
    if (window.event.which === 1 && !cell.isMarked && !cell.isShown) {
        //on First click
        if (gGame.shownCount === 0 && cell.isMine) {
            firstClick(i, j)
            cell = gBoard[i][j]
        }
        if (cell.isMine) {
            //if mine - game over!
            renderCell(i, j, MINE);
            elCell.classList.add('shown')
            return freezeBoard()
        }
        //if cell is'nt mine, without neighbors- MODEL + DOM
        else if (!cell.minesAroundCount) {
            return expandShown(elCell, i, j)
        }
        //if cell is'nt mine, with neighbors- MODEL + DOM
        else {
            renderCell(i, j, cell.minesAroundCount);
            cell.isShown = true;
            elCell.classList.add('shown')
            gGame.shownCount++;
        }
        console.log(gGame.shownCount)
    }
    //un/mark a cell - MODEL + DOM
    if (window.event.which === 3 && !gBoard[i][j].isShown) {
        if (!gBoard[i][j].isMarked) {
            renderCell(i, j, FLAG);
            gBoard[i][j].isMarked = true;
            gGame.markedCount++
        } else {
            renderCell(i, j, '');
            gBoard[i][j].isMarked = false;
            gGame.markedCount--
        }
    }
    checkGameOver();
}


function firstClick(idx, jdx) {
    var cell = gBoard[idx][jdx]
    cell.isMine = false;
    cell.isMarked = false;
    cell.isShown = false;

    //random 1 new mine
    var newMineIdx = getRandomInt(0, gLevel.size)
    var newMineJdx = getRandomInt(0, gLevel.size)
    while (gBoard[idx][jdx].isMine) {
        newMineIdx = getRandomInt(0, gLevel.size)
        newMineJdx = getRandomInt(0, gLevel.size)
    }
    gBoard[newMineIdx][newMineJdx].isMine = true;
    gBoard[newMineIdx][newMineJdx].minesAroundCount = null;

    //update neihbors count for all:
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (!gBoard[i][j].isMine) {
                gBoard[i][j].minesAroundCount = howManyMinesAround(gBoard, i, j)
            }
        }
    }

    /*     //care the neihnors of old mine 
        for (var i = idx - 1; i <= idx + 1; i++) {
            if (i < 0 || i >= gLevel.size) continue;
            for (var j = jdx - 1; j <= jdx + 1; j++) {
                if (j < 0 || j >= gLevel.size) continue;
                cell.minesAroundCount = howManyMinesAround(gBoard, i, j)
            }
        }
        // care neighbors of new mine
        for (var i = newMineIdx - 1; i <= newMineIdx + 1; i++) {
            if (i < 0 || i >= gLevel.size) continue;
            for (var j = newMineJdx - 1; j <= newMineJdx + 1; j++) {
                if (i === newMineIdx && j === newMineJdx) continue;
                if (j < 0 || j >= gLevel.size) continue;
                cell.minesAroundCount = howManyMinesAround(gBoard, i, j)
            }
        } */
    matrixConsolePrint()
}

function expandShown(elCell, idx, jdx) {

    for (var i = idx - 1; i <= idx + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;
        for (var j = jdx - 1; j <= jdx + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue;
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            var cell = gBoard[i][j]
            if (!cell.isShown) {
                renderCell(i, j, cell.minesAroundCount);
                cell.isShown = true;
                elCell.classList.add('shown')
                gGame.shownCount++;
                console.log('count', gGame.shownCount)
                    //ASK: if the reccursion is ok here. and why??
                if (!cell.minesAroundCount) expandShown(elCell, i, j)
            }
        }
    }
}

//ASK: need to return something?
function checkGameOver() {
    var numAllCells = (gBoard.length) * (gBoard[0].length)

    if (gGame.markedCount === gLevel.mines && gGame.shownCount === (numAllCells - gLevel.mines)) {
        console.log('victory')
        freezeBoard()
    }
}

//function that freeze (render) the click on cells
function freezeBoard() {
    clearInterval(gGameInterval)
        //ASK: how can i do without select all cells
    var elTds = document.querySelectorAll('.board-container td')
    for (var i = 0; i < elTds.length; i++) {
        elTds[i].removeAttribute("onmouseup");
    }
    gGame.isOn = false;

    //reveal all mines when lose
    var numAllCells = (gBoard.length) * (gBoard[0].length)
    if (gGame.shownCount !== (numAllCells - gLevel.mines)) {

        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (gBoard[i][j].isMine) {
                    renderCell(i, j, MINE)
                    console.log('shiva')
                }
            }
        }
    }
}