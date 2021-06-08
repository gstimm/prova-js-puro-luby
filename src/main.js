(function (DOM, document) {
  'use strict';
  
  const $chooseGameButton = document.querySelectorAll("input[name='radio-button']");
  const $betDescription = document.querySelector('[data-js="bet-description"]');
  const $gameName = document.querySelector('[data-js="game-name"]');

  let $numbersField = document.querySelector('[data-js="numbers"]');

  let games = [];

  function init() {
    getGamesJSON();
  }
  
  function getGamesJSON() {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', '../games.json');
    ajax.send();
    ajax.addEventListener('readystatechange', () => getAllGames(ajax), false);
  }

  function getAllGames(ajax) {
    if (ajax.readyState === 4 && ajax.status === 200) {
      games = JSON.parse(ajax.responseText).types;
      event.target.value = 0;
      selectGameMode();
    };
  }

  function selectGameMode() {
    $chooseGameButton.forEach(game => {
      game.addEventListener('change', selectGameMode);
    });
    
    $betDescription.textContent = games[event.target.value].description;
    $gameName.textContent = games[event.target.value].type.toUpperCase();
    
    console.log('Checked radio with ID = '+  event.target.value);
    clearGameFields();
    fillGameNumbers();
  }

  function fillGameNumbers() {
    for (let value = 1; value <= games[event.target.value].range; value++) {
      $numbersField.insertAdjacentHTML(
        'beforeend', 
        `<button class="number" data-js="number" number="${value}">${value}</button>`
      );
    }
  }

  function clearGameFields() {
    $numbersField.innerHTML = '';
  }



  init();

})(window.DOM, document);
