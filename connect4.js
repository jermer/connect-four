/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

class Player {
  constructor(color) {
    this.color = color;
  }
}

class Game {

  constructor(p1, p2, height, width) {
    this.HEIGHT = height;
    this.WIDTH = width;

    this.players = [p1, p2];
    this.currPlayer = p1; // active player

    this.board = []; // array of rows, each row is array of cells (board[y][x])

    this.pauseClicks = false; // flag to temporarily ignore user clicks

    this.makeBoard();
    this.makeHtmlBoard();
  }

  /** makeBoard: create in-JS board structure:
   *    board = array of rows, each row is array of cells (board[y][x])
   */
  makeBoard() {
    for (let y = 0; y < this.HEIGHT; y++) {
      this.board.push(Array.from({ length: this.WIDTH }));
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */

  makeHtmlBoard() {
    // Get "htmlBoard" variable from the item in HTML w/ID of "board"
    const htmlBoard = $('#board').empty();

    // Create the top table row of the game board, and listen for clicks in the row
    const top = $('<tr>')
      .attr('id', 'column-top')
      .on('click', this.handleClick.bind(this));

    // Create the individual cells of the top row
    for (let x = 0; x < this.WIDTH; x++) {
      const headCell = $('<td>')
        .attr('id', x);

      // add a "ghost piece" to be displayed in the top row
      const ghostPiece = $('<div>')
        .addClass(`ghostpiece piece`)
        .css('background-color', this.currPlayer.color);
      // .addClass(`ghostpiece piece player${this.currPlayer}`);

      headCell.append(ghostPiece);
      top.append(headCell);
    }
    htmlBoard.append(top);

    // Create HEIGHT additional rows for the table
    for (let y = 0; y < this.HEIGHT; y++) {
      const row = $('<tr>');

      // Create WIDTH cells in each of the new rows
      for (let x = 0; x < this.WIDTH; x++) {
        const cell = $('<td>')
          .attr('id', `${y}-${x}`);
        row.append(cell);
      }
      htmlBoard.append(row);
    }
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */

  findSpotForCol(x) {
    for (let y = this.HEIGHT - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place piece into HTML table of board */

  placeInTable(y, x) {
    const newPiece = $('<div>')
      .addClass(`piece animpiece player${this.currPlayer}`)
      .css('background-color', this.currPlayer.color);
    // .addClass(`piece animpiece player${this.currPlayer}`);

    $(`#${y}-${x}`).append(newPiece);
  }

  /** endGame: announce game end */

  endGame(msg) {
    // done in a timeout to allow the DOM to refresh before announcing the winner
    setTimeout(() => {
      this.pauseClicks = true;
      alert(msg);
    }, 250);
  }

  /** handleClick: handle click of column top to play piece */

  handleClick(evt) {
    if (this.pauseClicks) {
      return;
    }
    else {
      this.pauseClicks = true;
      setTimeout(() => {
        this.pauseClicks = false;
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
    var y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.placeInTable(y, x);

    // update in-memory board
    this.board[y][x] = this.currPlayer;

    // check for win
    if (this.checkForWin()) {
      const winner = this.currPlayer === this.players[0] ? 1 : 2;
      this.endGame(`Player ${winner} wins!`);
      return;
    }

    // check for tie, if all cells in the board are filled
    if (this.board.every(row => row.every(col => col))) {
      return this.endGame(`It's a tie!`);
    }

    // switch players
    this.switchPlayers();
  }


  /** Switch players **/

  switchPlayers() {
    this.currPlayer =
      this.currPlayer === this.players[0] ? this.players[1] : this.players[0];

    // change the color of the ghost pieces in column headers
    //$('.ghostpiece').toggleClass('player1 player2');
    $('.ghostpiece').css('background-color', this.currPlayer.color);
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin() {
    const _win = (cells) => {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer

      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.HEIGHT &&
          x >= 0 &&
          x < this.WIDTH &&
          this.board[y][x] === this.currPlayer
      );
    }

    // loop over cells in the grid
    for (var y = 0; y < this.HEIGHT; y++) {
      for (var x = 0; x < this.WIDTH; x++) {
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

} // end class Game


/**
 * Button to start the game
 */
const button = $('#start-btn').on('click', handleButtonClick);

function handleButtonClick(evt) {

  p1 = new Player($('#p1-color').val());
  p2 = new Player($('#p2-color').val());
  // p1 = new Player( document.getElementById('p1-color').value );
  // p2 = new Player( document.getElementById('p2-color').value );

  new Game(p1, p2, 6, 7);
}