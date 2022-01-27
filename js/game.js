'use strict';

/* const WALL = '#';
const FOOD = '.';
const SUPER_FOOD = '$' */
const FLAG = '🚩'
const MINE = '💣'
const NORMAL_SMILY = '😊'
const SAD_SMILY = '🤢';
const WIN_SMILY = '🤠';
const HINT = '👀'
const MAN_MINE = '🧨'

//defualt level
var gMines = [];
var gGameInterval;
var gLives = 0;
var gHints = 3;
var gSafes = 3;
var gHintToggle = false
var gBestResult = Infinity;
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
    secsPassed: 0,
    isManualMines: false,
    isSevenBoom: false
};

function init(size = 4, mines = 2) {
    //reset values
    clearInterval(gGameInterval)
    gLevel.size = size;
    gLevel.mines = mines;
    gGame.isOn = true;
    gGame.score = 0;
    gGame.shownCount = 0;
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.isManualMines = false;
    gGame.isSevenBoom = false;
    gMines = [];
    gHints = 3;
    gSafes = 3;
    renderHint()
    toggleSmily()

    //storage:
    // bestScore()

    //init counter and lives and safe click
    gLives = 0;
    var elH2 = document.querySelector('h2')
    elH2.innerText = 0.0
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = `get 3 lives - optional`
    var elSafe = document.getElementById('safe')
    elSafe.innerHTML = 'get 3 safe clicks'

    gBoard = buildBoard(); //[][] - {i:, j:, value:}
    renderBoard(gBoard, '.board-container');
    matrixConsolePrint()

}

//TODO this func..
function undo() {}

function safeClick() {
    var elSafe = document.getElementById('safe')
        //render cell
        //get random + open for 1 sec
    if (gSafes > 0) {
        var idx = getRandomInt(0, gLevel.size)
        var jdx = getRandomInt(0, gLevel.size)
        while (gBoard[idx][jdx].isShown || gBoard[idx][jdx].isMine) {
            idx = getRandomInt(0, gLevel.size)
            jdx = getRandomInt(0, gLevel.size)
        }
        var elCell = document.querySelector(`.cell-${idx}-${jdx}`)
        renderCell(idx, jdx, gBoard[idx][jdx].minesAroundCount);
        elCell.classList.toggle('shown')
        elCell.classList.toggle('safe-on')

        //return the cell
        setTimeout(() => {
            elCell.classList.toggle('shown')
            elCell.classList.toggle('safe-on')
            renderCell(idx, jdx, null);

        }, 2000);
    }

    //render button
    if (gSafes === 0) {
        elSafe.innerHTML = `${gSafes} safe click left`
    } else {
        gSafes--
        elSafe.innerHTML = `${gSafes} safe click left`
    }
}

//use session storage - The data is deleted when the user closes the specific browser tab. need fixing
function bestScore() {
    var CurrResult = document.querySelector('h2').innerText;
    var elResults = document.getElementById("results")

    sessionStorage.setItem("lastname", CurrResult);

    //bring to top else bring bottom
    if (CurrResult < gBestResult && checkVictory()) {
        gBestResult = CurrResult;

        elResults.innerHTML = "Best result " + sessionStorage.getItem("lastname") + " seconds.\n" + elResults.innerHTML;
    } else if (checkVictory()) {
        elResults.innerHTML = elResults.innerHTML + "Best result " + sessionStorage.getItem("lastname") + " seconds.\n";
    }
}

function renderHint() {

    var elHints = document.querySelector('.hint-container')
    var strHTML = '<table><tr>'
    for (var i = 0; i < gHints; i++) {
        strHTML += `<td onclick="useHint(this)">${HINT}</td>`
    }
    strHTML += '</tr></tbody>'
    elHints.innerHTML = strHTML;
}

//defult null cause it comes from another func also
function useHint(elHint = null, idx = null, jdx = null) {
    //toggle hiiden
    if (elHint.innerHTML === HINT) {
        elHint.classList.toggle('hidden')
        gHintToggle = true;
        gHints--;
    }
    // 

    if (idx !== null) {
        for (var i = idx - 1; i <= idx + 1; i++) {
            if (i < 0 || i >= gLevel.size) continue;
            for (var j = jdx - 1; j <= jdx + 1; j++) {
                if (j < 0 || j >= gLevel.size) continue;
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                var cell = gBoard[i][j]
                console.log(i, j)
                if (!cell.isShown) {
                    if (cell.isMine) {
                        renderCell(i, j, MINE);
                    } else {
                        renderCell(i, j, cell.minesAroundCount);
                    }
                    elCell.classList.add('shown')
                }
            }
        }
        setTimeout(() => {
            for (var i = idx - 1; i <= idx + 1; i++) {
                if (i < 0 || i >= gLevel.size) continue;
                for (var j = jdx - 1; j <= jdx + 1; j++) {
                    if (j < 0 || j >= gLevel.size) continue;
                    var elCell = document.querySelector(`.cell-${i}-${j}`)
                    var cell = gBoard[i][j]
                    console.log(i, j)
                    if (!cell.isShown) {
                        elCell.classList.remove('shown')
                        renderCell(i, j, null);
                    }
                }
            }
            gHintToggle = false;
        }, 1000);
    }
}

function toggleSmily() {
    var elSmily = document.querySelector('.smily')
    if (gGame.shownCount === 0) {
        elSmily.innerHTML = NORMAL_SMILY;
    } else if (!checkVictory()) {
        elSmily.innerHTML = SAD_SMILY;
    } else if (checkVictory()) {
        elSmily.innerHTML = WIN_SMILY;
    }
}

function livesSupportToggle() {
    var elLives = document.querySelector('.lives')

    if (gLives === 0) {
        gLives = 3;
        elLives.innerHTML = `${gLives} lives left`

    } else {
        elLives.innerHTML = `${gLives - 1} lives left`
    }
}

function counter() {
    //TODO: there's bug in the counter, need fix - think it fixed
    clearInterval(gGameInterval)
    var elH2 = document.querySelector('h2')
    var startTime = Date.now();

    if (gGame.shownCount === 0) {
        gGameInterval = setInterval(function() {
            elH2.innerText = (Date.now() - startTime) / 1000
        }, 100);
    }
}

function cellClicked(elCell, i, j) {
    if (gGame.shownCount === 0) counter()

    //set mines manually:
    if (gGame.isManualMines) {
        gBoard[i][j].isMine = true;
        gBoard[i][j].minesAroundCount = null;
        //array for saving mines indexes
        gMines.push({ i: i, j: j })
        renderCell(i, j, MAN_MINE)
        setTimeout(() => {
            renderCell(i, j, null)
        }, 1000);
        if (gMines.length === gLevel.mines) {
            gGame.isManualMines = false;
            allNegsCount(gBoard)
            return
        }
        return
    }

    if (gHintToggle) {
        useHint(elCell, i, j)
        return;
    }

    var cell = gBoard[i][j]

    // left 1, right 3
    if (window.event.which === 1 && !cell.isMarked && !cell.isShown) {
        //on First click
        if (gGame.shownCount === 0 && cell.isMine) {
            firstClick(i, j)
            cell = gBoard[i][j]
        }
        if (cell.isMine) {
            if (gLives > 0) {
                livesSupportToggle()
                gLives--;
                renderCell(i, j, MAN_MINE);
                setTimeout(() => {
                    renderCell(i, j, null);
                }, 1000);
                //TODO - small render to show its mine and back
            } else {
                //if mine - game over!
                renderCell(i, j, MINE);
                elCell.classList.add('shown')
                return freezeBoard()
            }
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
    if (checkVictory()) freezeBoard()
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
function checkVictory() {
    var numAllCells = (gBoard.length) * (gBoard[0].length)

    if (gGame.markedCount === gLevel.mines && gGame.shownCount === (numAllCells - gLevel.mines)) {
        console.log('victory')
        return true;
        // freezeBoard()
    }
    return false;
}

//function that freeze (render) the click on cells
function freezeBoard() {
    bestScore();
    // clearInterval(gGameInterval)
    counter()
        //ASK: how can i do without select all cells
    var elTds = document.querySelectorAll('.board-container td')
    for (var i = 0; i < elTds.length; i++) {
        elTds[i].removeAttribute("onmouseup");
    }
    gGame.isOn = false;
    toggleSmily()

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