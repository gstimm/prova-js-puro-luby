(function (DOM, document) {
  'use strict';
  
  const $chooseGameButtons = document.querySelector('[data-js="choose-game-buttons"]');
  const $betDescription = document.querySelector('[data-js="bet-description"]');
  const $gameName = document.querySelector('[data-js="game-name"]');
  const $numbersField = document.querySelector('[data-js="numbers"]');

  const $bets = document.querySelector('[data-js="bets"]');

  const $clearSelectedNumbers = document.querySelector('[data-js="clear-selected-numbers"]');
  const $addToCartButton = document.querySelector('[data-js="add-to-cart-button"]');
  const $completeGame = document.querySelector('[data-js="complete-game-numbers"]');
  const $saveButton = document.querySelector('[data-js="save-button"]');

  const $totalValueField = document.querySelector('[data-js="total-value"]');

  let betId = 0;
  let games = [];
  let selectedNumbers = [];
  let selectedGame = {};
  let bets = [];
  let betTotalValue = 0;

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
      document.querySelector(`[data-js="${number}"]`)
        .setAttribute('style', 'background-color: #ADC0C4;')
    });
    selectedNumbers = [];
  }

  function listenFunctionalButtons() {
    $clearSelectedNumbers.addEventListener('click', clearSelectedNumbers);
    $addToCartButton.addEventListener('click', addToCart);
    $completeGame.addEventListener('click', completeGame);
    $saveButton.addEventListener('click', saveGame);
  }

  function addToCart() {
    if (selectedNumbers.length !== selectedGame['max-number']) {
      return alert('Preencha todos os números para adicionar o jogo ao carrinho!');
    }
    createBet();
    betId += 1;
    clearSelectedNumbers();
  }

  function createBet() {
    $bets.insertAdjacentHTML('beforeend',
      `<div class="bet-card" data-id="${betId}" data-js="bet${selectedGame.type}">
        <img data-js="remove-bet-from-cart" src="/src/styles/icons/trash-2.svg"/>
        <div class="bet${selectedGame.type} bet-interior">
          <span class="bet-cart-numbers">${selectedNumbers.sort((a, b) => a - b).join(', ')}</span>
          <div class="bet-name-price">
            <p class="bet-name-${selectedGame.type}">${selectedGame.type}</p>
            <span class="bet-price">${String(selectedGame.price.toFixed(2)).replace('.', ',')}</span></div>
        </div>
      </div>`
    );

    bets.push({
      "id": betId,
      "type": selectedGame.type,
      "price": selectedGame.price,
      "numbers": selectedNumbers.sort((a, b) => a - b).join(', '),
    })

    console.log(bets)

    betTotalValue += selectedGame.price;

    changeTotalValue();
    removeBetFromCart();
  }

  function removeBetFromCart() {
    const betToBeRemoved = document.querySelector(`[data-id="${betId}"]`);

    betToBeRemoved.addEventListener('click', () => {
      bets = bets.filter(bet => {
        return bet.id !== Number(betToBeRemoved.dataset.id)
      })

      for (let index = 0; index < games.length; index++) {
        if(betToBeRemoved.dataset.js === `bet${games[index].type}`) {
          betTotalValue -= games[index].price;
        }
        changeTotalValue(selectedGame.price);
        betToBeRemoved.remove();
      }
    })
  }

  function changeTotalValue() {
    $totalValueField.textContent = String(betTotalValue.toFixed(2)).replace('.', ',');
  }

  function completeGame() {
    let randomBetNumbers = [];
    while(selectedNumbers.length < selectedGame['max-number']) {
      randomBetNumbers = Math.ceil(Math.random() * (selectedGame.range));
      if(!isInCurrentBet(randomBetNumbers))
        document.querySelector(`[data-js='${randomBetNumbers}']`).click();
    }
  }

  function isInCurrentBet(number) {
    return selectedNumbers.some(item => {
      return number === item;
    })
  }

  function saveGame() {
    console.log(bets)
    if ($bets.childNodes.length <= 1) {
      return alert('Seu carrinho está vazio!');
    }



    
  }

  init();

})(window.DOM, document);
