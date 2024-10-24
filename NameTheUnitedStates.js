/*
NameTheStates.js

Main script file for the Name The States game.
*/

var g_timerStarted; // TRUE if timer started, else FALSE
var g_timeStart;    // Date() game started
var g_timeFinished; // Time when game is finished.
var g_timerId;      // Global Timer ID that will be use to clear timeouts
var g_solved;       // TRUE if the game has been solved.
var g_cheatCost;    // Cost of cheating in seconds
var g_totalGuesses; // Total number of guesses
var g_fShowHelp;    // Show help (based on "show_help" URL param)

var g_stateSolvedColor = "#008000"; // darker green, for when state is solved.

var g_winAnimationRate = 500; // Winstate animation 'rate' (refresh in ms)

// If window width is less than this value, the State Names DIV will be moved
// to a position below the Map. see comments in the
// moveStateNamesContainerPosition() function for more details.
var g_minWidthToMoveStateNames = 700; //px

// When True, will cause debug.js to be included
var g_fDebugMode = false;

// When True, causes the state text divs to be created in random order
var g_fShuffleStateArray = false;

// When True, the map is not shown, which adds a little more difficulty.
var g_fHideMap = false;

// When true, the page is loaded and ShowAll() routine is executed.
var g_fShowall = false;

const QuizType = Object.freeze({
    random       : 0,
    alphabetical : 1
});

// Gets set to True, when page loaded with quiz_mode param, which causes
// the game to start.
var g_fQuizMode        = false;
var g_QuizStateList    = []; // States must be answered in this order.
var g_QuizStateCurrent = 0;
var g_QuizType         = QuizType['alphabetical'];


/*
rndInt

This function geneartes a random integer between [min and max] (inclusive)
*/
function rndInt(min, max) {
    return Math.floor((Math.random() * ((max+1) - min)) + min);
}


/*
shuffleArray

Based on:
https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

This version uses a for..loop to do the backwards walking iteration which is
more like the Fisher-Yates version
(https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) mentioned in that
StackOverflow posting.
*/
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


/*
clearSelection

Simple function to remove any incidental text selection, which may happen
when user is doing the Shift+Ctrl+Click cheat.
*/
function clearSelection()
{
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
}


/*
showAll

This function rolls through all the states and shows those that haven't been
solved yet.
*/
function showAll() {
    g_all_united_states.forEach( (state) => {
        colorState(state, g_stateSolvedColor);
        if (!state.solved) {
            state.solve();
            changeStateAbbreviationVisibility(state.state_abbreviation, true);
        }
    });

    stopGame();
}


/*
triggerTextHighlight

This function handles applying/re-applying the given highlight color.

It first removes any previous highlight rule and then applies the specified
rule.
*/
function triggerTextHighlight(obj, color='red') {
    obj.classList.remove('state-name-text-glow-red');
    obj.classList.remove('state-name-text-glow-green');
    obj.offsetHeight; // tickle to re-trigger animation.
    obj.classList.add(`state-name-text-glow-${color}`);
}


/*
onStateNameClick

Function that handles the onclick event for a given state text or svg element.
Used mainly during user choosing to expose next char of state name.
*/
function onStateNameClick(e, state) {
    var fShiftKey = e.shiftKey;
    var fCtrlKey  = e.ctrlKey;

    if (fShiftKey && fCtrlKey && !state.solved) {
        startGame();
        state.revealLetter();
        g_timeStart = g_timeStart - (g_cheatCost * 1000);
    }

    // Clear any incidental text selection from the Shift+Click action.
    clearSelection();
}


/*
buildStateNameGrid

This function handles building the grid of state names.
Style rules determine layout.

Each state is in the form of:
<div id="state_AL">
    <span id="state_ID" class="state-name-span-font state-name-span-blurred">Idaho</span>
</div>

An onclick handler is added to the Div, to handle that event.

Once this Div/Span block is created, its added to the corresponding state
object in the main g_all_united_states array, for processing later (like
when a state is 'solved').
*/
function buildStateNameGrid() {
    var stateNameContainer = document.getElementById('stateNameContainer');

    g_all_united_states.forEach( (state) => {
        let newStateDIV  = document.createElement('div');
        let newSpan      = document.createElement('span');

        newStateDIV.id  = `state_${state.state_abbreviation}`;
        newStateDIV.classList.add('state-name-div');

        newSpan.id  = `${newStateDIV.id}`;

        // Initially, the newSpanBlur will contain the entire state name.
        newSpan.classList.add('state-name-span-font');
        newSpan.classList.add('state-name-span-blurred');
        newSpan.classList.add('state-name-span-size');
        newSpan.innerText = `${state.state_name}`;

        newStateDIV.addEventListener('click',
            (e) => {
                onStateNameClick(e, state);
            }
        );

        newStateDIV.appendChild(newSpan);

        stateNameContainer.appendChild(newStateDIV);

        state.stateDIV = newStateDIV;
    });
}


/*
addPathAndRectOnClickHandlers

This function handles setting up onclick handlers for the state path and rect
elements in the SVG map.

This allows the user to 'cheat' by holding down Shift+Click and get one of
the states letters exposed.
*/
function addPathAndRectOnClickHandlers() {

    // reduces a few duplicate lines below.
    function svg_element_onclick(svgobj, stateobj) {
        svgobj.addEventListener('click',
            (e) => {
                onStateNameClick(e, stateobj);
            }
        );
    }

    g_all_united_states.forEach( (state) => {
        var path = document.getElementById(`path_${state.state_abbreviation}`);
        if (path) {
            svg_element_onclick(path, state);
        }
        var rect = document.getElementById(`rect_${state.state_abbreviation}`);
        if (rect) {
            svg_element_onclick(rect, state);
        }
    });
}


/*
getStateObjFromAbbreviation

Simple helper function to retreive state object with the given abbreviation.

Example:
    getStateObjFromAbbreviation("OH");

    Function should return StateObject for "Ohio"

NOTE: Currently not used anywhere, but might be as new features are added.
*/
function getStateObjFromAbbreviation(abbrev) {
    return g_all_united_states.find(
        (x) => x.state_abbreviation.toLowerCase() == abbrev.toLowerCase()
    );
}


/*
checkEntry

This function handles checkign the Guess text (ex. "New York"), and if it's a
a valid state and not yet 'solved', it handles making the state abbreviation
visible, the color of the state to get set to solved color, and call
updateProgress() to check on the new state of the game.
*/
function checkEntry() {
    var txtStateName = document.getElementById('txtStateNameEntry');

    var guess = txtStateName.value.toLowerCase().trim();

    if (guess.length > 0) {
        // If this is the first entry tried, we kick things off by setting
        //state, getting the start time, and triggering the timer.
        if (!g_timerStarted) {
            startGame();
        }

        txtStateName.value = '';
    }

    // All games need this, right? :)
    if (guess == "uuddlrlrbas") {
        showAll();
        stopGame();
        showWinState();
        return;
    }

    // Check to see if Guess is a valid state name
    var found = g_all_united_states.find(
        (x) => x.state_name.toLowerCase() == guess);

    // This will be used to flash the guess whent it's made.
    // Starts out initialized to the WRONG answer css rule, which makes some of
    // the fall through states easier to bail from and result in the expected
    // effect.
    var answerAttemptclassName = 'incorrect-answer-text-glow';

    // This do...while(false) approach is just a lazy/cheap way to allow a
    // 'break' to bail from the routine without having introduce more
    // complicated if/else structuring.  The Quiz mode was added after the main
    // routine was completed, so it's a simple way to support quiz mode and
    // maintain exepected functionality.
    do {
        if (found) {
            // If we're in Quiz mode and the guess does not match what's being
            // asked for, simply break out since we've initialized the class name
            // for an incorrect answer as default.
            if (g_fQuizMode &&
                (guess != g_all_united_states[g_QuizStateList[g_QuizStateCurrent]].
                    state_name.toLowerCase())
            ) {
                break;
            }

            // If the guess was found (and in the case of Quiz Mode, matches the
            // target state), but it's not already solved, handle 'solving'
            if(!found.solved) {
                found.solve();
                changeStateAbbreviationVisibility(found.state_abbreviation, true);
                colorState(found, g_stateSolvedColor);
                answerAttemptclassName = 'correct-answer-text-glow';
                flashInput(txtStateName, answerAttemptclassName, 300);

                if (g_fQuizMode) {
                    g_QuizStateCurrent++;
                    // A little funky here.  If we're at the end, lock the
                    // index to the last state.  Other side of this conditional
                    // means we've solved the state and want to pop-out the next
                    // one in the list.
                    if (g_QuizStateCurrent > g_all_united_states.length-1) {
                        g_QuizStateCurrent = g_all_united_states.length-1;
                    } else {
                        popOutState(g_all_united_states[
                            g_QuizStateList[g_QuizStateCurrent]].
                            state_abbreviation);
                    }
                }

            // Else, just flash the name green to indicate it was already
            // solved.
            // Also, don't flash the input box.  This will further draw
            // attention to the green flash of the state name.
            } else {
                triggerTextHighlight(found.stateDIV, 'green');
                answerAttemptclassName = '';
            }
        } else {
            answerAttemptclassName = 'incorrect-answer-text-glow';
        }
    } while(false);

    flashInput(txtStateName, answerAttemptclassName, 300);
    updateProgress();
}



/*
stopGame

This function handles setting the variables indicating game is over, as well
as clearing any lingering timer.
*/
function stopGame() {
    g_timerStarted = false;

    clearTimeout(g_timerId);
}

function numberCurrentlySolved() {
    var solved = 0;

    g_all_united_states.forEach( (state) => {
        if (state.solved) {
            solved++;
        }
    });

    return solved;
}


/*
updateProgress

This function handles updating the "n/50" status text and if all states have
been solved, calls stopGame and showWinState to finish things out.
*/
function updateProgress() {
    var spanProgress = document.getElementById('progress');
    var guessedRight = numberCurrentlySolved();

    spanProgress.innerText = `${guessedRight} / ${g_all_united_states.length} `+
        `states guessed right (total guesses: ${g_totalGuesses})`;

    if (guessedRight == g_all_united_states.length) {
        g_timeFinished = new Date();
        g_solved = true;
        stopGame();
        showWinState();
    }
}


// List of basic colors for cycling during win state.
var g_winColors = [
    "#000000", "#FF4500",
    "#FF0000", "#DAA520",
    "#00FF00", "#87CEFA",
    "#0000FF", "#FF00FF",
    "#FFFF00", "#00FFFF"
]


/*
winStateLoop

This function handles the looping behavior of the Win State.
Mainly just cycles through setting the stroke to one of the predefined
colors, and setting a timeout for it to be called again.
*/
function winStateLoop() {
    g_all_united_states.forEach( (state) => {
        state.stateDIV.style.stroke =
            g_winColors[rndInt(0, g_winColors.length-1)];
    });

    g_timerId = setTimeout(winStateLoop, g_winAnimationRate);
}


/*
showWinState

This function is called when the game has been won.

It cycles through all states, setting things up for the animated dash behavior.
It calls winStateLoop() to cause the color to cycle.
*/
function showWinState() {
    var svgUS = document.getElementById('united-states-svg');

    var states = svgUS.querySelectorAll('path, rect');

    for (var i = 0; i < states.length; i++ ) {
        // states[i].style.strokeDasharray = "100";
        // states[i].style.strokeWidth = 6;
        // states[i].style.animation =
        //     "color-cycling-dash 6s linear infinite";
        states[i].classList.add('state-win-animation');
    }

    removeExistingPopOuts();

    winStateLoop();
}


/*
updateTimer

This function starts when the first name is guessed, and is called continually
until the game reaches one of the end states.

It handles showing the elapsed time in H:MM:SS format.
When > 24hrs, hrs just continues counting up.

TODO:  Switch this up to just keep track of total seconds and then convert to
HH:MM:SS display.  This will allow for pausing the timer when the instructions
are shown.  This was all created before I added the instructions and there
was no idea of pausing the timer.
*/
function updateTimer() {
    if (g_timerStarted) {
        var timeNow = new Date();

        // Assume time marches forward, so no Math.abs() used...
        var diff  = (timeNow - g_timeStart) / 1000;

        // Days
        // Not used here as most likely never even hit an hour elapsed
        // time, so this keeps the resulting time string simpler/cleaner by not
        // including a 'Days' value that would likely always be 0.
        // Leaving this code here, in case future copy/pasters need it :o)
        //
        // var DAY_IN_SECONDS = 24 * 60 * 60;
        // var days = Math.floor( diff / DAY_IN_SECONDS );
        // diff -= days * DAY_IN_SECONDS;

        // Hours
        var HOURS_IN_SECONDS = 60 * 60;
        var hrs = Math.floor( diff / HOURS_IN_SECONDS );
        diff -= hrs * HOURS_IN_SECONDS;

        // Minutes
        var MINUTES_IN_SECONDS = 60;
        var min = Math.floor( diff / MINUTES_IN_SECONDS);
        diff -= min * MINUTES_IN_SECONDS;
        var min_padding = (min < 10) ? '0': ''; // min < 10, "0" will be added

        // Seconds
        var sec = Math.floor(diff);
        var sec_padding = (sec < 10) ? '0': '';// sec < 10, "0" will be added

        var elapsed_time = document.getElementById('elapsed_time');

        elapsed_time.innerHTML =
            `  [${hrs}:${min_padding}${min}:${sec_padding}${sec}]`;

        g_timerId = setTimeout(updateTimer, 1000);
    }
}


/*
colorState

This function handles coloring the given state with the specified color.

The state param is the StateObject and color is in the format of "#000000"
*/
function colorState(state, color) {
    var svgUS = document.getElementById('united-states-svg');
    if (!svgUS) {
        console.log(`SVG not found. Check for corrupted page source or errors`);
        return;
    }

    // Find the path that represents the state region in the map
    // Some states have a flyout and the query will return both path and rect
    // elements that need to be coloring.
    // querySelectorAll() supports comma separated values and combines as OR'd
    var obj = svgUS.querySelectorAll(`#path_${state.state_abbreviation}, ` +
        `#rect_${state.state_abbreviation}`);

    obj.forEach( (e) => {
        e.style.fill = color;
    });
}


/*
changeStateAbbreviationVisibility

This function handles changing the states abbreviation visibility.

Initially, it's called for all states to hide the abbreviation (fShow == false).
And is called again with fShow == true, as names are guessed correctly.
*/
function changeStateAbbreviationVisibility(abbrev, fShow = true) {
    var svgUS = document.getElementById('united-states-svg');
    if (!svgUS) {
        console.log(`SVG not found. Check for corrupted page source or errors`);
        return;
    }

    var obj = svgUS.querySelector(`#text_${abbrev}`);
    if (obj) {
        if (fShow) {
            obj.style.display = '';
        } else {
            obj.style.display = 'none';
        }
    }
}


/*
hideStateAbbreviations

Function to handle hiding all state abbreviations.
*/
function hideStateAbbreviations() {
    g_all_united_states.forEach( (state) => {
        changeStateAbbreviationVisibility(state.state_abbreviation, false);
    });
}

/*
removeExistingPopOuts

This function handles removing any currently "popped out" state, returning it
to it's original, flat/level state.

This is mostly called during popOutState() and helps to ensure there's only one
state that appears popped out at a time, by removing any previously popped out
state.

It's also called when the win animation is shown, so the last Popped out state
(in quiz mode) is not left in that state.
*/
function removeExistingPopOuts() {
    var svg = document.getElementById('united-states-svg');

    // Clear out any existing <use> tags, also remove the filter form the
    // original elements that the <use> tags were pointing to.
    var existing_use_elements = svg.querySelectorAll('use');
    existing_use_elements.forEach( (e) => {
        var orig_element = document.querySelector(e.href.baseVal);
        if (orig_element) {
            if (orig_element.getAttributeNames().find( (e) => e == 'filter')) {
                orig_element.removeAttribute('filter');
            }
        }
        e.parentNode.removeChild(e)
    });

    // Also clear out any elements with the marching ants highlight
    var marching_ants = document.querySelectorAll('.quiz-state-highlight');
    marching_ants.forEach( (e) => {
        e.classList.remove('quiz-state-highlight');
    });

 }

/*
popOutState

This function handles modifying the appropriate state SVG elements, to make
the state with the state_abbreviation appear to pop-out of the map.

This is mostly used during one of the Quiz modes.

It calls removeExistingPopOuts() to clear any existing popped out states, so
there will only be one popped out at a time.
*/
function popOutState(state_abbreviation) {
    var state_elements;
    var svg = document.getElementById('united-states-svg');

    if (state_abbreviation !== undefined) {
        state_elements = document.querySelectorAll(
            `#path_${state_abbreviation},#rect_${state_abbreviation},`+
            `#text_${state_abbreviation},#tspan_${state_abbreviation}`);
    } else {
        return;
    }

    removeExistingPopOuts();

    state_elements.forEach( (elem) => {
        // Skip any text or tspan.  Could flip this logic to just apply
        // attribute setting for path and rect, but 'return'is like a simple
        // for..loop 'continue'
        if (elem.id.match(/(text_|tspan_)/i)) {
            return;
        }
        elem.setAttribute('filter', 'url(#stateGlow)');

        // Add marching ants to give it more attention.
        elem.classList.add('quiz-state-highlight');
    });

    // Depending on where the state is in the SVG, adding the dropshadow
    // may actually be occluded by a nearby state (if it appears after this
    // target state in the svg).
    // To deal with this, we add a <use> tag to the SVG at the bottom with
    // an href to the id of the state we're attempting to pop out.
    // This ensures that the target state is is rendered last (and thus, on
    // top of any nearby states).
    var states_array = Array.from(state_elements);

    // Sorting this way will put the <use> tags in order of
    //   PATH > RECT > TEXT > TSPAN  ...which will render as expected.
    states_array.sort( (a,b) => { return ((a.id > b.id) ? 1 : -1) });

    // Finally, add the <use> tags.
    states_array.forEach( (state) => {
        var use_elem = document.createElementNS(svg.namespaceURI, 'use');
        use_elem.setAttribute(`href`,`#${state.id}`);
        svg.appendChild(use_elem);
    });
}


/*
flashInput

This function handles setting the given className on the given input.

The Obj is expect to be the txtStateNameEntry Input, and the className either
the "correct" or "incorrect" answer CSS rule.

The call to removeClassFromObjectAfterTime() schedules a timeout, to remove
the class being added.
*/
function flashInput(obj, className, time) {
    if (!obj || (className.length == 0)) {
        return;
    }

    obj.classList.add(className);
    obj.offsetHeight;

    removeClassFromObjectAfterTime(obj, className, time);
}

/*
removeClassFromObjectAfterTime

Function that creates a timeout to remove a className from an object.
    obj       : HTML Element
    className : Name of the class to remove
    time      : Timeout in ms
*/
function removeClassFromObjectAfterTime(obj, className, time) {
    setTimeout( () => {
        obj.classList.remove(className)
    }, time);
}

/*
startGame

This function is called when the game starts and initialized some variables
as well as kicks off the updateTimer() cycle.
*/
function startGame() {
    var currentInfo = document.getElementById('currentInfo');
    if (currentInfo) {
        currentInfo.classList.remove('display-hidden');
    }

    if (!g_timerStarted && !g_solved) {
        g_timerStarted = true;
        g_timeStart    = new Date();
        updateTimer();
    }
}


/*
startQuizMode

This function is called when the "quiz_mode" param is present int he URL.
It sets things up to start the Quiz.
*/
function startQuizMode() {

    // This array of indices will serve as constraint for guessing order.
    g_QuizStateList = Array(g_all_united_states.length).fill().map((x, i) => i);

    if (g_fQuizType == QuizType['random']) {
        shuffleArray(g_QuizStateList);
    }

    // Now, pop out the state first in the order.
    popOutState(g_all_united_states[
        g_QuizStateList[g_QuizStateCurrent]].
        state_abbreviation);
}


/*
doCheck

This function is called every time the user tries a name.
*/
function doCheck() {
    g_totalGuesses++;
    checkEntry();
}

/*
handleEventKeyUp

KeyUp handler for the entry INPUT, to handle Enter/NumpadEnter to call doCheck()
*/
function handleEventKeyUp(evt) {
    if (evt.code === 'Enter' || evt.code === 'NumpadEnter') {
        doCheck();
    }
}

/*
ProcessSearchString

This function handles checking the URI for any params that may be present.
*/
function processSearchString(searchString) {
    var urlsp = new URLSearchParams(searchString.toLowerCase());

    g_fDebugMode         = urlsp.has('debug');
    g_fShuffleStateArray = urlsp.has('shuffle_states');
    g_fHideMap           = urlsp.has('hide_map');
    g_fShowall           = urlsp.has('show_all');
    g_fQuizMode          = urlsp.has('quiz_mode');
    g_fShowHelp          = urlsp.has('show_help');

    // Quiz Mode requires checking for which type of quiz.
    if (g_fQuizMode) {
        var quizType = urlsp.get('quiz_mode').toLowerCase();
        g_fQuizType = QuizType[quizType];
        if (g_fQuizType === undefined) {
            console.log(`Quiz Type: ${quizType} is unknown. Defaulting to `+
                `'alphabetical'`);
            g_fQuizMode = QuizType['alphabetical'];
        }
    }
}


/*
stopAndClearWinAnimation

This function handles removing the "Win" animation from the states.

Clicking or tapping on the SVG map when the win animation is showing, will
result in this function being called.
*/
function stopAndClearWinAnimation() {
    var svgUS = document.getElementById('united-states-svg');

    var states = svgUS.querySelectorAll('path, rect');

    for (var i = 0; i < states.length; i++ ) {
        states[i].classList.remove('state-win-animation');
    }
}


/*
svgMapOnClick

Onclick handler for the SVG map.
Most useful when win animation plays, and user wants to stop and just view
solved map in default color.
*/
function svgMapOnClick() {
    if (g_solved || g_fDebugMode) {
        stopAndClearWinAnimation();
        stopGame();
    }
}


/*
hideMap

Simply apply display-hidden rule to the SVG map.
Usually if "hide_map" param added to the URI
*/
function hideMap() {
    var svgMap = document.getElementById('united-states-svg');
    svgMap.classList.add('display-hidden');
}


/*
moveStateNamesContainerPosition

Attempt to move the State Names container DIV to the desired position.

This is a bit of an after-thought hack.  If the width of the client area is
narrow (like Portrait mode on some devices) the div with the state names adjust
to less columns, and thus pushes the map farther down the page.

In the modes where the map is show, this then makes it appear partially or
completely off the bottom of the display.

This function simply moves the state names DIV to a location below the map.

The "right" solution here, is probably to use CSS rules to adjust for various
screen sizes, but this was all added late and works as expected.
*/
function moveStateNamesContainerPosition(position) {
    var stateNamesDIV        = document.querySelector('#stateNameContainer');
    var stateNamesRootTop    = document.querySelector('#idStateNamesRootTop');
    var stateNamesRootBottom = document.querySelector(
        '#idStateNamesRootBottom');

    if (position == "top") {
        if (stateNamesDIV.parentNode.id == stateNamesRootBottom.id) {
            stateNamesRootTop.appendChild(stateNamesDIV);
        }
    } else if (position == "bottom") {
        if (stateNamesDIV.parentNode.id == stateNamesRootTop.id) {
            stateNamesRootBottom.appendChild(stateNamesDIV);
        }
    }
}


/*
onWindowResize

Function to handle window resizing.

Mainly calls moveStateNamesContainerPosition to position the State Names
containing DIV, based on window width compared to g_minWidthToMoveStateNames.
*/
function onWindowResize() {
    var height = window.innerHeight;
    var width  = window.innerWidth;

    var stateNamesDIV = document.querySelector('#stateNameContainer');
    var svgMap = document.getElementById('united-states-svg');

    // If the height of the State Names div is going to push the map off the
    // bottom of the screen, then move it to a position below the map.
    //  -OR-
    // If the window width is less than g_minWidthToMoveStateNames, do the
    // reposition anyway, as it's likely a narrow (or portrait) display.
    if (((window.innerHeight - stateNamesDIV.clientHeight) <
            svgMap.clientHeight) ||
        (window.innerWidth < g_minWidthToMoveStateNames)) {
        moveStateNamesContainerPosition('bottom');
    } else {
        moveStateNamesContainerPosition('top');
    }
}


/*
onDocumentKeyDown
*/
function onDocumentKeyDown(e) {
    // Show the instructions when user hits the Ctrl+"?" (which is technically
    // Ctrl+Shift+"?" ...but should be clear to users.
    if (e.key == "?") {
        if (e.ctrlKey) {
            toggleShowInstructions();
        }
    }

    // If user hits Escape and we're currently showing the instructions,
    // dismiss.
    if ((e.key == "Escape") && (g_fShowingInstructions)) {
        toggleShowInstructions();
    }
}


/*
init

Main function that runs on DOMContentLoaded event, setting up the various
globals and calling routines to get the game setup and ready for play.
*/
function init() {
    var nameEntry = document.getElementById('txtStateNameEntry');
    nameEntry.addEventListener('keyup', handleEventKeyUp);

    var svgMap = document.getElementById('united-states-svg');
    svgMap.addEventListener('click', svgMapOnClick);

    g_timerStarted  = 0;
    g_timeStart     = null;
    g_timeFinished  = null;
    g_timerId       = -1;
    g_solved        = false;
    g_cheatCost     = 10;
    g_totalGuesses  = 0

    processSearchString(location.search);

    // If "debug" part of URI, load in the debug.js file which will enable
    // various UI elements and some debug/testing functionality
    // If the debug.js file is not available, it will just throw a
    // ERR_FILE_NOT_FOUND error in the console, but shouldn't affect any
    // core functionality.  Debug mode was mainly useful for me during 
    // development.
    if (g_fDebugMode) {
        var debug_script = document.createElement('script');
        debug_script.src = "Debug.js";
        debug_script.onload = ( (e) => {
            init_debug();
        });
        document.body.appendChild(debug_script);
    }

    if (g_fQuizMode) {
        startQuizMode();
    }

    // Shuffling the array causes the 10x5 grid of state names to be ordered
    // randomly.
    if (g_fShuffleStateArray) {
        shuffleArray(g_all_united_states);
    }

    if (g_fHideMap) {
        hideMap();
    }

    hideStateAbbreviations();
    buildStateNameGrid();
    addPathAndRectOnClickHandlers();
    updateProgress();
    onWindowResize();

    if (g_fShowHelp) {
        toggleShowInstructions();
    }

    // "show_all" was in the URI, so call the ShowAll() method.
    // Used during dev/debugging.
    if (g_fShowall) {
        showAll();
    }

    document.addEventListener("keydown", onDocumentKeyDown);
}


document.addEventListener("DOMContentLoaded", init, false);
window.addEventListener("resize", onWindowResize, false);