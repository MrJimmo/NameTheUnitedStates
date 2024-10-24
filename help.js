/*
help.js

This file contains various functions and other things that power the Help dialog
shown when the user clicks the (?) button or Ctrl+?.
*/

// TRUE means we're showing the Help dialog.
var g_fShowingInstructions = false;

/*
The PlayLevel object is defined in this file, since the main page behavior is
(currently) only driven by URI params, so this pseudo-enum is only used in this
context.
*/
const PlayLevel = Object.freeze({
    LEVEL_EASY   : 1,
    LEVEL_NORMAL : 2,
    LEVEL_HARD   : 3,
    LEVEL_EXPERT : 4
});

/*
playLevel

This function reloading of the page, based on the specified playLevel.
*/
function playLevel(playLevel) {
    this.event.preventDefault();
    switch (playLevel) {
        case PlayLevel.LEVEL_EASY:
            reloadPage(``);
            break;
        case PlayLevel.LEVEL_NORMAL:
            reloadPage(`shuffle_states`);
            break;
        case PlayLevel.LEVEL_HARD:
            reloadPage(`hide_map`);
            break;
        case PlayLevel.LEVEL_EXPERT:
            reloadPage(`shuffle_states&hide_map`);
            break;
        default:
            reloadPage(``);
            break;
    }
}

/*
reloadPage

Simple function to reload with the provided searchString param.
Example: "shuffle_states&hide_map"
*/
function reloadPage(searchString) {
    if (searchString.length > 0) {
        location.href = `${location.pathname}?${searchString}`;
    } else {
        location.href = `${location.pathname}`;
    }
}


/*
loadInQuizMode

This function calls reloadPage with the quiz_mode param and the specified
quiz type.
*/
function loadInQuizMode(quiz_type) {
    reloadPage(`quiz_mode=${quiz_type}`);
}


/*
toggelShowInstructions

This function handles showing or hiding the Help dialog.
*/
function toggleShowInstructions() {
    var instructions   = document.querySelector('#instructionsPopup');
    var blurredOverlay = document.querySelector('#blurredBackroundOverlay');
    var questionMark   = document.querySelector('#questionMark');

    // If it's hidden, show it.
    if (instructions.classList.contains('instructions-hidden')) {
        instructions.classList.remove('instructions-hidden');
        blurredOverlay.style.display = "block";
        questionMark.style.display   = "none";
        g_fShowingInstructions       = true;
    // Else, hide it.
    } else {
        instructions.classList.add('instructions-hidden');
        blurredOverlay.style.display = "none";
        questionMark.style.display   = "inline";
        g_fShowingInstructions       = false;
    }
}

/*
blurredOverlayOnClick

Simple function to handle clicks outside the help dialog and cause the dialog
to close.
*/
function blurredOverlayOnClick() {
    if (g_fShowingInstructions) {
        toggleShowInstructions();
    }
}


function init() {
    var popupCloseButton = document.getElementById('popupCloseButton');
    var blurredOverlay   = document.querySelector('#blurredBackroundOverlay');
    var questionMark     = document.querySelector('#questionMark');
    var cheatPenalty     = document.querySelector('#cheatPenaltyText');

    popupCloseButton.addEventListener("click", toggleShowInstructions);
    blurredOverlay.addEventListener("mousedown", blurredOverlayOnClick);
    questionMark.addEventListener("click", toggleShowInstructions);

    cheatPenalty.textContent = `${(typeof g_cheatCost === 'undefined') ? 'N' :
        g_cheatCost} second`;

}

document.addEventListener("DOMContentLoaded", init, false);
