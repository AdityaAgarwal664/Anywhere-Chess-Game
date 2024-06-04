const pieces = {
    '♔': 'white king',
    '♕': 'white queen',
    '♖': 'white rook',
    '♗': 'white bishop',
    '♘': 'white knight',
    '♙': 'white pawn',
    '♚': 'black king',
    '♛': 'black queen',
    '♜': 'black rook',
    '♝': 'black bishop',
    '♞': 'black knight',
    '♟': 'black pawn'
};

const initialBoard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

let board = JSON.parse(JSON.stringify(initialBoard));
let selectedPiece = null;
let currentPlayer = 'white';

function createBoard() {
    const chessboard = document.querySelector('.chessboard');
    chessboard.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((i + j) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = i;
            square.dataset.col = j;
            square.dataset.piece = board[i][j];
            square.textContent = board[i][j];
            square.draggable = true;
            square.addEventListener('dragstart', handleDragStart);
            square.addEventListener('dragover', handleDragOver);
            square.addEventListener('drop', handleDrop);
            chessboard.appendChild(square);
        }
    }
}

function handleDragStart(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const piece = board[row][col];
    if (piece && pieces[piece].startsWith(currentPlayer)) {
        selectedPiece = { piece, row, col };
    }
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    movePiece(row, col);
}

// Function to move a piece
// Function to move a piece
function movePiece(row, col) {
    if (selectedPiece) {
        const { piece, row: fromRow, col: fromCol } = selectedPiece;
        const pieceColor = pieces[piece].startsWith('white') ? 'white' : 'black';
        const targetPiece = board[row][col];

        // Check if the selected piece belongs to the current player
        if (pieceColor !== currentPlayer) {
            console.log("Invalid move: You can't move the opponent's piece.");
            return;
        }

        if (isValidMove(piece, fromRow, fromCol, row, col)) {
            const capturedPiece = board[row][col];
            const capturedPieceColor = capturedPiece ? (pieces[capturedPiece].startsWith('white') ? 'white' : 'black') : null;

            // Check if the captured piece belongs to the same player
            if (capturedPieceColor === pieceColor) {
                console.log("Invalid move: You can't capture your own piece.");
                return;
            }

            board[row][col] = piece;
            board[fromRow][fromCol] = '';
            selectedPiece = null;
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            // Check if a piece was captured
            if (capturedPiece) {
                setTimeout(() => {
                    const capturedPieces = document.querySelector(`.${capturedPieceColor}-captured-pieces`);
                    const capturedPieceElement = document.createElement('div');
                    capturedPieceElement.textContent = capturedPiece;
                    capturedPieces.appendChild(capturedPieceElement);
                    // If the captured piece is a king, declare the winner
                    if (capturedPiece === '♔' || capturedPiece === '♚') {
                        const winner = currentPlayer === 'white' ? 'Black' : 'White';
                        declareWinner(winner);
                        return; // Exit the function early to prevent further moves
                    }
                }, 1500); // Delay execution by 0 milliseconds to allow DOM update
            }
            
            createBoard();
        }
    }
}


function isValidMove(piece, fromRow, fromCol, toRow, toCol) {
    if (!isMoveWithinBoard(toRow, toCol)) return false;
    if (isSamePosition(fromRow, fromCol, toRow, toCol)) return false;
    if (!isValidPieceMovement(piece, fromRow, fromCol, toRow, toCol)) return false;
    if (!isPathClear(piece, fromRow, fromCol, toRow, toCol)) return false;
    return true;
}

function isMoveWithinBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isSamePosition(row1, col1, row2, col2) {
    return row1 === row2 && col1 === col2;
}

function isValidPieceMovement(piece, fromRow, fromCol, toRow, toCol) {
    const pieceType = pieces[piece].split(' ')[1];
    switch (pieceType) {
        case 'king':
            return isValidKingMove(fromRow, fromCol, toRow, toCol);
        case 'queen':
            return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case 'rook':
            return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case 'bishop':
            return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case 'knight':
            return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case 'pawn':
            return isValidPawnMove(piece, fromRow, fromCol, toRow, toCol);
        default:
            return false;
    }
}

function isPathClear(piece, fromRow, fromCol, toRow, toCol) {
    const pieceType = pieces[piece].split(' ')[1];
    switch (pieceType) {
        case 'king':
            return true; // King can move only one square in any direction, no need to check path
        case 'queen':
            return isPathClearForQueen(fromRow, fromCol, toRow, toCol);
        case 'rook':
            return isPathClearForRook(fromRow, fromCol, toRow, toCol);
        case 'bishop':
            return isPathClearForBishop(fromRow, fromCol, toRow, toCol);
        case 'knight':
            return true; // Knight can jump over other pieces, no need to check path
        case 'pawn':
            return isPathClearForPawn(fromRow, fromCol, toRow, toCol);
        default:
            return false;
    }
}

function isPathClearForQueen(fromRow, fromCol, toRow, toCol) {
    return isPathClearForRook(fromRow, fromCol, toRow, toCol) || isPathClearForBishop(fromRow, fromCol, toRow, toCol);
}

function isPathClearForRook(fromRow, fromCol, toRow, toCol) {
    if (fromRow === toRow) {
        const step = fromCol < toCol ? 1 : -1;
        for (let col = fromCol + step; col !== toCol; col += step) {
            if (board[fromRow][col] !== '') return false;
        }
        return true;
    }
    if (fromCol === toCol) {
        const step = fromRow < toRow ? 1 : -1;
        for (let row = fromRow + step; row !== toRow; row += step) {
            if (board[row][fromCol] !== '') return false;
        }
        return true;
    }
    return false;
}

function isPathClearForBishop(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
    const rowStep = fromRow < toRow ? 1 : -1;
    const colStep = fromCol < toCol ? 1 : -1;
    for (let row = fromRow + rowStep, col = fromCol + colStep; row !== toRow; row += rowStep, col += colStep) {
        if (board[row][col] !== '') return false;
    }
    return true;
}

function isPathClearForPawn(fromRow, fromCol, toRow, toCol) {
    const direction = pieces[board[fromRow][fromCol]].startsWith('white') ? -1 : 1;
    if (fromCol === toCol) {
        if (board[toRow][toCol] !== '') return false; // Pawn can't move forward if destination is blocked
        if (toRow - fromRow === direction) return true; // Pawn can move one step forward
        if (fromRow === (pieces[board[fromRow][fromCol]].startsWith('white') ? 6 : 1) && toRow - fromRow === 2 * direction && board[toRow - direction][toCol] === '') return true; // Pawn can move two steps forward from starting position
        return false;
    }
    if (Math.abs(toCol - fromCol) === 1 && toRow - fromRow === direction && board[toRow][toCol] !== '' && !pieces[board[toRow][toCol]].startsWith(currentPlayer)) {
        return true; // Pawn can capture diagonally
    }
    return false;
}

function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 1);
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return isValidRookMove(fromRow, fromCol, toRow, toCol) || isValidBishopMove(fromRow, fromCol, toRow, toCol);
}

function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    return fromRow === toRow || fromCol === toCol;
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    return Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol);
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isValidPawnMove(piece, fromRow, fromCol, toRow, toCol) {
    // Pawn movement validation already handled in isPathClearForPawn function
    return isPathClearForPawn(fromRow, fromCol, toRow, toCol);
}
// Function to prompt for player names



document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded, calling promptForPlayerNames...");
    createBoard();
});


// Add event listener for clicking on a square
document.addEventListener('click', function(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    if (!isNaN(row) && !isNaN(col)) {
        handleClick(row, col);
    }
});

// Function to handle square click
function handleClick(row, col) {
    const piece = board[row][col];
    if (piece && pieces[piece].startsWith(currentPlayer)) {
        const validMoves = getValidMoves(piece, row, col);
        showValidMoves(validMoves);
    }
}

// Function to get valid moves for a piece

    // Implement valid moves logic for other pieces (king, queen, rook, bishop, knight)


// Function to show valid moves on the board
function showValidMoves(validMoves) {
    const chessboard = document.querySelector('.chessboard');
    validMoves.forEach(move => {
        const square = chessboard.querySelector(`.square[data-row="${move.row}"][data-col="${move.col}"]`);
        if (square) {
            const validMoveIndicator = document.createElement('div');
            validMoveIndicator.classList.add('valid-move');
            validMoveIndicator.style.top = `${square.offsetTop + 35}px`;
            validMoveIndicator.style.left = `${square.offsetLeft + 35}px`;
            chessboard.appendChild(validMoveIndicator);
        }
    });
}
// Function to check if the game is over (i.e., if a king is captured)
function findPiecePosition(piece) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === piece) {
                return { row, col };
            }
        }
    }
    return null; // Return null if the piece is not found on the board
}

// Function to declare the winner and display a popup message
function declareWinner(winner) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <div class="winner-image">
            <img src="${winner === 'White' ? 'white.png' : 'black.png'}" alt="${winner} King">
        </div>
        <div class="winner-text">
            <h2>${winner} Won!</h2>
        </div>
    `;
    document.body.appendChild(popup);
}

createBoard();