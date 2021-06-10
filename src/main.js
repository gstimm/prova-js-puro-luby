(function (DOM, document) {
  'use strict';
  
  const $chooseGameButtons = document.querySelector('[data-js="choose-game-buttons"]');
  const $betDescription = document.querySelector('[data-js="bet-description"]');
  const $gameName = document.querySelector('[data-js="game-name"]');
  const $numbersField = document.querySelector('[data-js="numbers"]');

  const $bets = document.querySelector('[data-js="bets"]');

  const $clearSelectedNumbers = document.querySelector('[data-js="clear-selected-numbers"]');
  const $addToCartButton = document.querySelector('[data-js="add-to-cart-button"]');

  let games = [];
  let selectedNumbers = [];
  let selectedGame = {};
  let bets = [];

  function init() {
    getGamesJSON();
  }
  
  function getGamesJSON() {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', '../games.json');
    ajax.send();
    ajax.addEventListener('readystatechange', () => getAllGames(ajax));
  }

  function getAllGames(ajax) {
    if (ajax.readyState === 4 && ajax.status === 200) {
      games = JSON.parse(ajax.responseText).types;
      createGameButtons();
      listenFunctionalButtons();
    };
  }

  function createGameButtons() {
    games.forEach(game => {
      $chooseGameButtons.insertAdjacentHTML(
        'beforeend', 
        `<button class="game-button ${game.type}" data-js="${game.type}" >
          ${game.type}
        </button>`
      );
    });
    addClickEventAndChangeButtonColor();
    addFirstAccessData(changeSelectedButtonColor(0));
  }

  function addFirstAccessData() {
    fillGameData(getGameInfo('Lotofácil')[0]);
  }

  function getGameInfo(gameName) {
    return games.filter(game => {
      return game.type === gameName;
    })
  }

  function addClickEventAndChangeButtonColor() {
    Array.prototype.forEach.call($chooseGameButtons.childNodes, (button, index) => {
      button.addEventListener('click', () => {
        const gameName = getGameInfo(button.dataset.js)[0];
        fillGameData(gameName);
        changeSelectedButtonColor(index);
      });
    })
  }

  function changeSelectedButtonColor(index) {
    $chooseGameButtons.childNodes.forEach((button, currentIndex) => {
      const game = getGameInfo(button.dataset.js)[0];
      
      if (currentIndex === index) {
        button.style.backgroundColor = `${game.color}`;
        button.style.color = 'white';
      } else {
        button.style.backgroundColor = 'white';
        button.style.color = `${game.color}`;
      } 
    })
  }

  function fillGameData(gameName) {
    $betDescription.innerText = gameName.description;
    $gameName.innerText = gameName.type.toUpperCase();

    Object.assign(selectedGame, gameName);

    clearNumbersField();
    fillGameNumbers(gameName);
    
    selectedNumbers = [];
    handleBetNumbers(gameName);
  }

  function fillGameNumbers(gameName) {
    for (var index = 1; index <= gameName.range; index++) {
      $numbersField.insertAdjacentHTML(
        'beforeend',
        `<button class="number" data-js="${index}" value="${index}">
          ${index}
        </button>`
      );
    }
  }

  function clearNumbersField() {
    $numbersField.innerHTML = '';
  }

  function handleBetNumbers(gameName) {
    Array.prototype.forEach.call($numbersField.childNodes, button => {
      button.addEventListener('click', () => {
        var index = selectedNumbers.indexOf(Number(button.value));

        if (index >= 0) {
          selectedNumbers.splice(index, 1);
        }

        if (selectedNumbers.length < gameName['max-number']) {
          selectedNumbers.push(Number(button.value));
          button.setAttribute('style', `background-color: ${gameName.color}`);
        }
      })
    })
  }

  function clearSelectedNumbers() {
    selectedNumbers.forEach(number => {
      document.querySelector(`[data-js="${number}"]`).setAttribute('style', 'background-color: #ADC0C4;')
    });
    selectedNumbers = [];
  }

  function listenFunctionalButtons() {
    // $completeGameBtn.addEventListener('click', completeGame);
    $clearSelectedNumbers.addEventListener('click', clearSelectedNumbers);
    $addToCartButton.addEventListener('click', addToCart);
  }

  function addToCart() {

    bets.push(selectedNumbers);
    console.log(bets);

    createBet();

    clearSelectedNumbers();
  }



  function createBet() {
    $bets.insertAdjacentHTML('beforeend',
      `<div class="bet-card" data-js="bet${selectedGame.type}">
        <img src="/src/styles/icons/trash-2.svg"/>
        <div class="bet${selectedGame.type} bet-interior">
          <span class="bet-cart-numbers">${selectedNumbers.sort((a, b) => a - b).join(', ')}</span>
          <div class="bet-name-price">
            <p class="bet-name-${selectedGame.type}">${selectedGame.type}</p>
            <span class="bet-price">${String(selectedGame.price.toFixed(2)).replace('.', ',')}</span></div>
        </div>
      </div>`
    )
  }


  init();

})(window.DOM, document);
