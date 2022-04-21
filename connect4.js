/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
const board = [];   // array of rows, each row is array of cells (board[y][x])

let pauseClicks = false;  // temporarily ignore user clicks

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
  for (let y = 0; y < HEIGHT; y++) {
    let newRow = [];
    for (let x = 0; x < WIDTH; x++) {
      newRow.push(null);
    }
    board.push(newRow);
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  // Get "htmlBoard" variable from the item in HTML w/ID of "board"
  const htmlBoard = document.getElementById('board');

  // Create the top table row of the game board, and listen for clicks in the row
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  // Create the individual cells of the top row
  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);

    // add a "ghost piece" to be displayed in the top row
    const ghostPiece = document.createElement("div");
    ghostPiece.classList.add(`ghostpiece`, `piece`, `player${currPlayer}`);
    headCell.append(ghostPiece);

    top.append(headCell);
  }
  htmlBoard.append(top);

  // Create HEIGHT additional rows for the table
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    // Create WIDTH cells in each of the new rows
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}

/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
  for (y = HEIGHT - 1; y >= 0; y--) {
    let cell = document.getElementById(`${y}-${x}`);
    if (!cell.hasChildNodes())
      return y;
  }
  return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  const newPiece = document.createElement("div");
  newPiece.classList.add(`piece`, `animpiece`, `player${currPlayer}`);
  const destinationCell = document.getElementById(`${y}-${x}`);
  destinationCell.append(newPiece);
}

/** endGame: announce game end */

function endGame(msg) {
  // done in a timeout to allow the DOM to refresh before announcing the winner
  setTimeout(() => {
    pauseClicks = true;
    alert(msg);
  }, 250);
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  if (pauseClicks) {
    return;
  }
  else {
    pauseClicks = true;
    setTimeout(() => {
      pauseClicks = false;
    }, 250);
  }

  // a click in the cell might be on the "ghost piece" or in the empty area of the cell
  let x;
  if (evt.target.classList.contains("piece")) {
    // console.log("clicked piece");
    // change the target to be the cell
    x = +evt.target.parentElement.id;
  }
  else {
    // console.log("clicked empty space");
    x = +evt.target.id;
  }

  // get next spot in column (if none, ignore click)
  var y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place piece in board and add to HTML table
  placeInTable(y, x);

  // update in-memory board
  board[y][x] = currPlayer;

  // check for win
  if (checkForWin()) {
    endGame(`Player ${currPlayer} wins!`);
    return;
  }

  // check for tie, if all cells in the board are filled
  if (board.every(row => {
    return row.every(col => col !== null);
  })) {
    return endGame(`It's a tie!`);
  }

  // switch players
  switchPlayers();
}


/** Switch players **/

function switchPlayers() {
  currPlayer === 1 ? currPlayer = 2 : currPlayer = 1;

  // change the color of the ghost pieces in column headers
  const ghostArr = [...document.querySelectorAll(".ghostpiece")];
  ghostArr.map((val) => {
    val.classList.toggle('player1');
    val.classList.toggle('player2');
    return val;
  })
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  // loop over cells in the grid
  for (var y = 0; y < HEIGHT; y++) {
    for (var x = 0; x < WIDTH; x++) {
      // check to the right in the grid
      var horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      // check down in the grid
      var vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      // check diagonal down and to the right
      var diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      // check diagonal down and to the left
      var diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
      // check whether any of those four directions contains a win
      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

makeBoard();
makeHtmlBoard();
