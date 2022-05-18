const messageContainer = document.getElementById('message-container');
const board = document.getElementById('board');
const keyboard = document.getElementById('keyboard');
const offsetFromDate = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
let dictionary = [];
let targetWords = [];

function fetchData() {
  fetch('/dictionary.json')
    .then((res) => res.json())
    .then((data) => (dictionary = data))
    .catch((error) => console.log(error));
  fetch('/targetWords.json')
    .then((res) => res.json())
    .then((data) => (targetWords = data))
    .catch((error) => console.log(error));
}
function createSvg() {
  const backspaceSvg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  backspaceSvg.setAttribute('height', '24');
  backspaceSvg.setAttribute('viewBox', '0 0 24 24');
  backspaceSvg.setAttribute('width', '24');
  const backspacePath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );
  backspacePath.setAttribute('fill', 'var(--color-tone-1)');
  backspacePath.setAttribute(
    'd',
    'M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z'
  );
  backspaceSvg.appendChild(backspacePath);

  return backspaceSvg;
}
function getTargetWord() {
  return targetWords[Math.floor(dayOffset)];
}

function handleClick(event) {
  const letterClicked = event.target.dataset.key;
  switch (letterClicked) {
    case 'ENTER':
      submitGuess();
      break;
    case 'REMOVE':
      removeLetter();
      break;
    default:
      addLetter(letterClicked.toLowerCase());
      break;
  }
}
function handleKeyPress(event) {
  const key = event.key;
  if (key === 'Enter') submitGuess();
  else if (key === 'Backspace') removeLetter();
  else if (key.match(/^[a-z]$/)) addLetter(key);
}

function startInteraction() {
  document.addEventListener('keydown', handleKeyPress);
}
function stopInteraction() {
  document.removeEventListener('keydown', handleKeyPress);
}

function getActiveTiles() {
  return board.querySelectorAll('[data-state="active"]');
}

function addLetter(letter) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= 5) return;
  const nextTile = board.querySelector(':not([data-letter])');
  nextTile.dataset.letter = letter.toLowerCase();
  nextTile.textContent = letter;
  nextTile.dataset.state = 'active';
}
function removeLetter() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) return;
  lastTile.textContent = '';
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}
function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length < 5) {
    displayMessage('Not enough letters!');
    shakeTiles(activeTiles);
    return;
  }
  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, '');
  if (!dictionary.includes(guess)) {
    displayMessage('Not in the word list!');
    shakeTiles(activeTiles);
    return;
  }
  stopInteraction();
  activeTiles.forEach((...params) => flipTile(...params, guess.toLowerCase()));
}
function displayMessage(message, duration = 1000) {
  const msg = document.createElement('div');
  msg.textContent = message;
  msg.classList.add('message');
  messageContainer.prepend(msg);

  if (duration == null) return;

  setTimeout(() => {
    msg.classList.add('hide');
    msg.addEventListener('transitionend', () => {
      msg.remove();
    });
  }, duration);
}
function shakeTiles(tiles) {
  tiles.forEach((tile) => {
    tile.classList.add('shake');
    tile.addEventListener(
      'animationend',
      () => {
        tile.classList.remove('shake');
      },
      { once: true }
    );
  });
}
function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter.toLowerCase();
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  const targetWord = getTargetWord();

  setTimeout(() => {
    tile.classList.add('flip');
  }, (index * 500) / 2);

  tile.addEventListener(
    'transitionend',
    () => {
      tile.classList.remove('flip');
      if (targetWord[index] === letter) {
        tile.dataset.state = 'correct';
        key.classList.add('correct');
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = 'wrong-location';
        key.classList.add('wrong-location');
      } else {
        tile.dataset.state = 'wrong';
        key.classList.add('wrong');
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          'transitionend',
          () => {
            startInteraction();
            checkWinLose(guess, array, targetWord);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
}
function checkWinLose(guess, tiles, targetWord) {
  if (guess === targetWord) {
    displayMessage('You Win', null);
    danceTiles(tiles);
    stopInteraction();
    return;
  }

  const remainingTiles = board.querySelectorAll(':not([data-letter])');
  if (remainingTiles.length === 0) {
    displayMessage(targetWord.toUpperCase(), null);
    stopInteraction();
  }
}
function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add('dance');
      tile.addEventListener(
        'animationend',
        () => {
          tile.classList.remove('dance');
        },
        { once: true }
      );
    }, (index * 500) / 5);
  });
}

function renderKeys() {
  const keys = [
    'Q',
    'W',
    'E',
    'R',
    'T',
    'Y',
    'U',
    'I',
    'O',
    'P',
    '',
    'A',
    'S',
    'D',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    '',
    'ENTER',
    'Z',
    'X',
    'C',
    'V',
    'B',
    'N',
    'M',
    'REMOVE',
  ];

  keys.map((key, index) => {
    if (key !== '') {
      const keyElement = document.createElement('button');
      keyElement.textContent = key.toUpperCase();
      keyElement.classList.add('key');
      keyElement.dataset.key = key;

      if (key === 'ENTER' || key === 'REMOVE')
        keyElement.classList.add('large');

      if (key === 'REMOVE') {
        const backspaceSvg = createSvg();
        keyElement.textContent = '';
        keyElement.appendChild(backspaceSvg);
      }
      keyElement.addEventListener('click', handleClick);
      keyboard.appendChild(keyElement);
    } else {
      const spaceElement = document.createElement('div');
      spaceElement.classList.add('space');
      keyboard.appendChild(spaceElement);
    }
  });
}
function renderTiles() {
  for (let i = 0; i < 30; i++) {
    const tileElement = document.createElement('div');
    tileElement.classList.add('tile');
    board.appendChild(tileElement);
  }
}

fetchData();
renderKeys();
renderTiles();
startInteraction();
