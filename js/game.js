'use strict';

/* const WALL = '#';
const FOOD = '.';
const SUPER_FOOD = '$' */
const FLAG = '🚩'
const MINE = '💣'

//defualt level
var gMarked = 0;
var gShown = 0;
var gLevel = {
    size: 4,
    mines: 2
}
var gBoard;
/* cell = { //maybe add i, j
    i: i,
    j: j,
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false
} */
var gGame = {
    isOn: false,
    score: 0,
    shownCount: 0,
    markedCount: 0, //How many cells are marked (with a flag)
    secsPassed: 0
};

function init() {
    //reset values
    gGame.isOn = true;
    gGame.score = 0;
    gGame.shownCount = 0;
    gGame.markedCount = 0
    gGame.secsPassed = 0

    gBoard = buildBoard(); //[][] - {i:, j:, value:}
    renderBoard(gBoard, '.board-container');
    matrixConsolePrint()

}

function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j]

    // left 1, right 3
    if (window.event.which === 1 && !cell.isMarked && !cell.isShown) {
        if (cell.isMine) {
            //if mine - game over!
            renderCell(i, j, MINE);
            elCell.classList.add('shown')
            return freezeBoard()
        }
        //if cell is'nt mine, without neighbors- MODEL + DOM
        else if (!cell.minesAroundCount) {
            /*             renderCell(i, j, cell.minesAroundCount);
                        cell.isShown = true;
                        elCell.classList.add('shown')
                        gGame.shownCount++; */
            //TODO add neghbors func
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

function expandShown(elCell, idx, jdx) {
    var minesCount = 0

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
    //ASK: how can i do without select all cells
    var elTds = document.querySelectorAll('.board-container td')
    for (var i = 0; i < elTds.length; i++) {
        elTds[i].removeAttribute("onmouseup");
    }
    gGame.isOn = false;
}