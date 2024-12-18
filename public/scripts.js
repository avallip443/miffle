const gameGrid = document.querySelector(".game-grid");

// vars for grid location
const maxRows = 6;
const maxCols = 5;
let currRow = 0;
let currCol = 0;

// vars for guesses
let guesses = Array.from({ length: maxRows }, () => Array(maxCols).fill(""));
let currGuess = "";

document.addEventListener("keydown", handleKeyPress);

async function handleKeyPress(event) {
  const key = event.key.toUpperCase();

  if (/^[A-Z]$/.test(key) && currCol < maxCols) {
    // add letter
    currGuess += key;
    updateGridCell(currRow, currCol, key);
    guesses[currRow][currCol] = key;
    currCol++;
  } else if (key === "BACKSPACE" && currCol > 0) {
    // remove last letter
    currGuess = currGuess.slice(0, -1);
    currCol--;
    guesses[currRow][currCol] = "";
    updateGridCell(currRow, currCol, "");
  } else if (key == "ENTER" && currCol === maxCols) {
    // submit current row when 5 letters entered
    const { validGuess, message } = await submitGuess(currGuess, currRow);

    console.log("res", validGuess, message);

    if (validGuess) {
      // user inputs another guess if current one is valid
      currRow++;
      currCol = 0;
      currGuess = "";
    }

    if (message) {
      console.log("game over", message);
    }
  }
}

function updateGridCell(row, col, letter) {
  const cellIndex = row * maxCols + col;
  const cell = gameGrid.children[cellIndex];
  cell.textContent = letter;
}

async function submitGuess(guess, currRow) {
  try {
    const response = await fetch("/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess }),
    });

    const data = await response.json();

    if (data.error) {
      invalidGridRow(currRow);
      return { validGuess: false, message: null };
    } else if (Array.isArray(data.game.feedback)) {
      updateGridRow(data.game.feedback, currRow);
      return { validGuess: true, message: data.message };
    } else {
      console.error("Unexpected feedback format:", data.game.feedback);
      return { validGuess: false, message: null };
    }
  } catch (error) {
    console.error("Error submitting guess:", error);
    invalidGridRow(currRow);
    return { validGuess: false, message: null };
  }
}

function updateGridRow(feedback, currRow) {
  feedback[currRow].forEach((status, col) => {
    const currCell = currRow * maxCols + col;
    const cell = gameGrid.children[currCell];
    const letter = guesses[currRow][col];

    // apply result styles
    cell.classList.remove("correct", "present", "absent", "invalid");
    cell.classList.add(status);
    updateKeyboard(letter, status);
  });
}

function invalidGridRow(currRow) {
  for (let i = 0; i < maxCols; i++) {
    const currCell = currRow * maxCols + i;
    const cell = gameGrid.children[currCell];

    // apply result styles
    cell.classList.remove("correct", "present", "absent", "invalid");
    cell.classList.add("invalid");
  }
}

function updateKeyboard(key, status) {
  const keyCell = document.querySelector(
    `.keyboard-grid .cell[data-key="${key}"]`
  );
  if (keyCell) {
    keyCell.classList.remove("correct", "present", "absent", "invalid");
    keyCell.classList.add(status);
  }
}
