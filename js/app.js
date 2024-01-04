const gameBoard = document.querySelector("#gameboard");
const playerDisplay = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const width = 8;
let playerTurn = "white";
playerDisplay.textContent = playerTurn;

const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
];

const createBoard = () => {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = startPiece;
        if (square.firstChild) square.firstChild.setAttribute('draggable', true);
        square.setAttribute('square-id', width**2 - 1 - i);
        const row = Math.floor((63 - i) / 8) + 1;
        if (row % 2 == 0) {
            if (i % 2 == 0) square.classList.add('grey');
            else square.classList.add('brown');
        }
        else {
            if (i % 2 == 0) square.classList.add('brown');
            else square.classList.add('grey');
        }
        if (i <= 15) square.firstChild.firstChild.classList.add('black');
        if (i >= 48) square.firstChild.firstChild.classList.add('white');
        gameBoard.append(square);
    });
};
createBoard();
const allSquares = document.querySelectorAll(".square");

let startPositionId;
let draggedElement;
let endPositionId;
const dragStart = (e) => {
    draggedElement = e.target;
    startPositionId = draggedElement.parentNode.getAttribute("square-id");
};

const dragOver = (e) => {
    e.preventDefault();
};

const changePlayer = () => {
    if (playerTurn === "white") {
        allSquares.forEach((square, i) =>
            square.setAttribute("square-id", i))
        playerTurn = "black";
        playerDisplay.textContent =playerTurn;
    }
    else{
        allSquares.forEach((square, i) =>
            square.setAttribute("square-id", width**2 - 1 - i))
        playerTurn = "white";
        playerDisplay.textContent =playerTurn;
    }
}

const dragDrop = (e) => {
    e.stopPropagation();
    const correctTurn = draggedElement.firstChild.classList.contains(playerTurn);
    const valid = checkIfValid(e.target);
    const opponent = playerTurn === 'white' ? 'black' : 'white';
    const takenByOpponent = e.target.firstChild?.classList.contains(opponent);

    if (correctTurn) {
        if (takenByOpponent && valid) {
            e.target.parentNode.append(draggedElement);
            e.target.remove();
            checkForWin();
            changePlayer();
            return;
        }
    
        if (valid) {
            e.target.append(draggedElement);
            changePlayer();
            return;
        }
        let text = infoDisplay.innerHTML;
        infoDisplay.innerHTML = "Invalid move";
        setTimeout(() => infoDisplay.innerHTML = text, 1000);
    }
};

allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart);
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', dragDrop);
});

const checkIfValid = (target) => {
    if (target.firstChild && target.firstChild.classList.contains(playerTurn)) return false;
    const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'));
    const startId = Number(startPositionId);
    const piece = draggedElement.id;
    switch(piece){
        case 'pawn':
            const startRow = [8, 9, 10, 11, 12, 13, 14, 15];
            if (startRow.includes(startId) && startId + width * 2 === targetId && !document.querySelector(`[square-id="${startId + 2 * width}"]`).firstChild ||
            startId + width === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild ||
            startId + width - 1 === targetId && document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild ||
            startId + width + 1 === targetId && document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild) return true;
            break;
        case 'knight':
            let knightMoves = [];
            for (let i=1; i<=2; i++) {
                knightMoves.push(startId + i*width - (i-3), 
                    startId + i*width + (i-3), 
                    startId - i*width - (i-3), 
                    startId - i*width + (i-3));
            }
            if (knightMoves.includes(targetId)) return true;
            break;
        case 'bishop':
        case 'queen':
            let bishopMoves = [];
            for (let i=1; i<=7; i++) {
                bishopMoves.push(startId + i*width + i, 
                    startId + i*width - i, 
                    startId - i*width + i, 
                    startId - i*width - i);
            }
            if (bishopMoves.includes(targetId)){
                let x = -1; // x is 1 if target square is left of start square and -1 otherwise
                let y = -1; // y is 1 if target square is upwards of start square and -1 otherwise
                if (bishopMoves.indexOf(targetId)%4 === 0 || bishopMoves.indexOf(targetId)%4 === 2) x = 1;
                if (bishopMoves.indexOf(targetId)%4 === 0 || bishopMoves.indexOf(targetId)%4 === 1) y = 1;
                for (let i=1; i<(targetId-startId)/(y*(width+x)); i++){
                    if (document.querySelector(`[square-id="${startId + i*(y*width + x)}"]`).firstChild) return false;
                }
                return true;
            }
            if (piece === 'bishop') break;
        case 'rook':
        case 'queen':
            let rookMoves = [];
            for (let i=1; i<=7; i++) {
                rookMoves.push(startId + i*width, 
                    startId - i*width, 
                    startId + i, 
                    startId - i);
            }
            if (rookMoves.includes(targetId)){
                let x = -1;  // x is 1 if target square is left of start square and -1 otherwise
                let y = -1;  // y is 1 if target square is upwards of start square and -1 otherwise
                if (rookMoves.indexOf(targetId)%4 === 2) x = 1;
                if (rookMoves.indexOf(targetId)%4 === 0) y = 1;
                if (targetId > startId + 7 || targetId < startId - 7){
                    for (let i=1; i<(targetId-startId)/(y*width); i++){
                        if (document.querySelector(`[square-id="${startId + i*y*width}"]`).firstChild) return false;
                    }
                }
                else{
                    for (let i=1; i<(targetId-startId)/x; i++){
                        if (document.querySelector(`[square-id="${startId + i*x}"]`).firstChild) return false;
                    }
                }
                return true;
            }
            break;
        default: // king
            let kingMoves = [];
            for (let i=-1; i<=1; i++){
                for (let j=-1; j<=1; j++){
                    if (!i && !j) continue;
                    kingMoves.push(startId + i*width + j);
                }
            }
            if (kingMoves.includes(targetId)){
                draggedElement.setAttribute("moved", true);
                return true;
            }
            // Castling
            let i = playerTurn === "white" ? 1 : -1;
            if ((startId - 2 === targetId || startId + 2 === targetId) && draggedElement.getAttribute("moved")==="false"){
                // King side castling
                if (
                    !document.querySelector(`[square-id="${startId - i}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startId - 2*i}"]`).firstChild &&
                    document.querySelector(`[square-id="${startId - 3*i}"]`).firstChild.id==="rook"){

                    rookPiece = document.querySelector(`[square-id="${startId - 3*i}"]`).firstChild;
                    rookPiece.remove();
                    document.querySelector(`[square-id="${startId - i}"]`).append(rookPiece);
                    return true;
                }
                // Queen side castling
                if (
                    !document.querySelector(`[square-id="${startId + i}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startId + 2*i}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startId + 3*i}"]`).firstChild &&
                    document.querySelector(`[square-id="${startId + 4*i}"]`).firstChild.id==="rook"){

                    rookPiece = document.querySelector(`[square-id="${startId + 4*i}"]`).firstChild;
                    rookPiece.remove();
                    document.querySelector(`[square-id="${startId + i}"]`).append(rookPiece);
                    return true;
                }
            }
    }
}
const checkForWin = () => {
    const kings = Array.from(document.querySelectorAll("#king"));
    if (!kings.some(king => king.firstChild.classList.contains("white"))){
        infoDisplay.innerHTML = "Black is victorious";
        const allSquares = document.querySelectorAll('.square');
        allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false));
    }
    else if (!kings.some(king => king.firstChild.classList.contains("black"))){
        infoDisplay.innerHTML = "White is victorious";
        const allSquares = document.querySelectorAll('.square');
        allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false));
    }
}

