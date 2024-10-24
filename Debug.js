/*
Debug.js

This file is expected to be included in the NameTheUnitedStates.html file, when
"debug" is added to the URI.

Stuff in this file was/is useful during development, testing, experimenting, and
was put into this separate file to keep the main game file more of a 'release'
version.

Much less time was spent on commenting this file than the others, so there
may actually be non-sensical comments and code at this point...at least, more
non-sensical than the other files :o)
*/

/*
This string contains HTML of various 'debug' UI elements, such as the "Show All"
and "Test" buttons, as well as a textarea for various output.
*/
var g_debug_ui = `
<button id="btnShowAll" onclick="showAll();" class="display-hidden">Show All</button>
<button id="btnSolveMap" onclick="doSolveMap();" class="display-hidden">Solve Map</button>
<button id="btnResetMap" onclick="resetMap();" class="display-hidden">Reset Map</button>
<button id="btnTest" onclick="doTest();" class="display-hidden">Test</button>

<div id="output-container" class="display-hidden">
    Output:<button id="btnClearOutput"  onclick="clearOutput();">Clear</button>
    <textarea style="width:100%" rows=22 id="txtOutput"></textarea>
</div>`;


// used by testLoop to cycle through all states.
var g_currentStateIndex = 0;


/*
Date::toDebugTimeString

Simple method added to the Date object, to build a basic time/date string, used
during various debug output calls.

Example of string built:
2024/10/3 11:4:37:763

The surrounding brackets "[]" are not included here, leaving the option to the
caller.

It's a bit silly, when you can get a similar (better?) string by 2 simple Date
object method calls:
    let dtNow  = new Date();
    `${dtNow.toLocaleDateString()} - ${dtNow.toLocaleTimeString()}`;
...which includes the padding already.

But like most of the other stuff, this was mainly a learning exercise in how to
bolt on a custom function to a built-in object.

Also lets me rearrange things to have YYYY/MM/DD format, which in certain cases
allows for sorting by ascending/descending based on the string. Ex. Files with
YYYYMMDD format, will sort by Year, Month, and then Day.
*/
Date.prototype.toDebugTimeString = function(){
    var year = this.getFullYear();
    var mon  = this.getMonth() + 1; //Months are zero-based.
    var day  = this.getDate();

    var hrs  = this.getHours();
    var mins = this.getMinutes();
    var secs = this.getSeconds();
    var ms   = this.getMilliseconds();

    // Figure out varius padding needed to accomodate single digits
    if (mon < 10) { mon = `0${mon}` };
    if (day < 10) { day = `0${day}` };

    if (hrs  < 10) { hrs  = `0${hrs}`  };
    if (mins < 10) { mins = `0${mins}` };
    if (secs < 10) { secs = `0${secs}` };

    // MS is 3 digits, so single and double digit values are accounted for here
    if (ms < 10) {
        ms = `00${ms}`;
    } else if (ms < 100) {
        ms = `0${ms}`;
    }

    // Return formatted as:  YYYY/MM/DD HH:MM:SS.sss
    return `${year}/${mon}/${day} ${hrs}:${mins}:${secs}.${ms}`;
}


/*
resetMapToUnsolvedState

This function handles resetting the map back to initial unsolved state.
    svg-state-path-default
    svg-state-callout-line-default
    svg-state-text-default

As well as rest the state coliring and hiding the abbreviations.

This was useful for debugging various solve/unsolved states and various
other tweaks.  It doesn't really 'solve' the game, and leaves things in an
overall pseudo-solved state.  Just reload the page to 'reset' the game.
*/
function resetMapToUnsolvedState() {
    var svgUS = document.getElementById('united-states-svg');

    // Selector means: Elements that do NOT begin with "path_callout"
    var paths = svgUS.querySelectorAll('path:not([id^="path_callout"])');
    for (var i = 0; i < paths.length; i++ ) {
        paths[i].classList.remove(...paths[i].classList);
        paths[i].classList.add('svg-state-path-default');
    }

    // Selector means: Elements that with IDs that begin with "path_callout"
    var callouts = svgUS.querySelectorAll('[id^="path_callout"]');
    for (var i = 0; i < callouts.length; i++ ) {
        callouts[i].classList.remove(...callouts[i].classList);
        callouts[i].classList.add('svg-state-callout-line-default');
    }

    // all <text> elements with an ID set
    var texts = svgUS.querySelectorAll('text[id]');
    for (var i = 0; i < texts.length; i++ ) {
        texts[i].classList.remove(...texts[i].classList);
        texts[i].classList.add('svg-state-text-default');
    }

    // all <text> elements with an ID set
    var rects = svgUS.querySelectorAll('rect[id]');
    for (var i = 0; i < rects.length; i++ ) {
        rects[i].classList.remove(...rects[i].classList);
        rects[i].classList.add('svg-state-path-default');
    }

    g_all_united_states.forEach( (state) => {
        hideStateAbbreviations();
        colorState(state, "");
        state.solved = false;
    });
}


/*
doSolveMap

This function mostly jumps right to the solved state, but doesn't reset
the game.

Mainly used during development, to trigger the Win animation.
*/
function doSolveMap() {
    showAll();
    g_all_united_states.forEach( (state) => {
        state.solved = true;
    });
    stopGame();
    showWinState();
}


/*
testLoop

Used as the main loop for filling in the states, simulating user input.
It skips a specific state, to allow manual entry as a way to stop just short
of going to full Win state.  Created before doSolveMap(), so leaving out the
last state may be unecessary.
*/
function testLoop() {
    var nameEntry = document.getElementById('txtStateNameEntry');

    nameEntry.value = g_all_united_states[g_currentStateIndex].state_name;
    if (nameEntry.value == "Utah") {
        nameEntry.value = "";
    }

    doCheck();

    g_currentStateIndex++;

    // Leave one unsolved (should be the one used earlier in this routine)
    // This enables a pause just before solving, to manuall check other things.
    // enter the last state manually and puzzle is solved.
    if (g_currentStateIndex < 50) {
        g_timerId = setTimeout(testLoop, 100);
    }
}


/*
doTest()

Kicks off simple testing routine.
*/
function doTest() {
    g_currentStateIndex = 0;
    g_totalGuesses      = 0;
    stopGame();
    testLoop();
}


function resetMap() {
    resetMapToUnsolvedState();
}


/*
setTextareaValue

Does the actual setting or appending of text, on the given Textarea object.
*/
function setTextareaValue(oTextArea, str, append=true) {
    if (append) {
        oTextArea.value = `${str}\n${oTextArea.value}`;
    } else {
        oTextArea.value = str;
    }
}

/*
outputToTextArea

Function to output the given string to the Output textarea.

Used for initial development/debugging.
*/
function outputToTextArea(str, append=true) {
    var txtInput = document.getElementById('txtOutput');
    if (txtInput) {
        setTextareaValue(txtInput, `[${(new Date().toDebugTimeString())}] `+
            `${str}`, append);
    }
}

function clearOutput() {
    clearTextarea(document.getElementById('txtOutput'));
}

function clearTextarea(oTextArea) {
    if (oTextArea) {
        oTextArea.value = "";
    }
}

function outputString(str) {
    console.log(`${str}`);
}


/*
addDebugUIElements

This function handles creating and the div containing some debug UI elements.
*/
function addDebugUIElements() {
    var debugUI = document.createElement('div');
    debugUI.id  = `debugUIElements`;

    // g_debug_ui should be found at the end of this file.
    debugUI.innerHTML = `${g_debug_ui}`;

    document.body.appendChild(debugUI)
}


/*
init_debug

This function handles setting things up for debug mode.
*/
function init_debug() {

    addDebugUIElements ();

    var make_visible_list = [];
    make_visible_list.push(document.getElementById('output-container'));
    make_visible_list.push(document.getElementById('btnShowAll'));
    make_visible_list.push(document.getElementById('btnResetMap'));
    make_visible_list.push(document.getElementById('btnSolveMap'));

    // Testing may not have expected results in Quiz Mode, so disable
    // The Test hasn't really changed, it just iterates through the state
    // list and in Quiz Mode, it may 'guess' one or two states, but in general
    // just stops with little to nothing solved.
    if (!g_fQuizMode) {
        make_visible_list.push(document.getElementById('btnTest'));
    }

    // Unhide the Debug UI parts.
    make_visible_list.forEach( (obj) => {
        obj.classList.remove("display-hidden");
    });

    // Reduces a few duplicate lines below.
    // If an onclick handler is already defined, this routine will call it
    // first, before the setTextAreaValue() call.  This is mainly to retain
    // the onclick behavior for Path and Rect objects that allow
    // Shift+Ctrl+Click to expose another letter of the state name.
    function svg_element_onclick(obj, prefix, state) {
        let existing_onclick_handler = obj.onclick;
        obj.addEventListener('click',(e) => {

            if (existing_onclick_handler) {
                existing_onclick_handler();
            }

            outputToTextArea(`${prefix} ${state.state_name} `+
                `(${state.state_abbreviation})`);

            // If Ctrl key pressed while clcking on a state, show it as popped
            // out.
            if (e?.ctrlKey) {
                removeExistingPopOuts();
                popOutState(state.state_abbreviation);
            }
        });

    }

    // Add onclick handles for all the path, rect, tspan, and text elements.
    // Clunky way to ensure that clicks are processed.
    // Alternative here is maybe use pointer-events css rule, but for now, this
    // is just debug mode stuff, so it stays.
    g_all_united_states.forEach( (state) => {
        var p = document.getElementById(`path_${state.state_abbreviation}`);
        if (p) {
            svg_element_onclick(p,`Clicked (path):`, state);
        }
        var r = document.getElementById(`rect_${state.state_abbreviation}`);
        if (r) {
            svg_element_onclick(r,`Clicked (rect):`, state);
        }
        var t = document.getElementById(`tspan_${state.state_abbreviation}`);
        if (t) {
            svg_element_onclick(t,`Clicked (tspan):`, state);
        }
        var tx = document.getElementById(`text_${state.state_abbreviation}`);
        if (tx) {
            svg_element_onclick(tx,`Clicked (text):`, state);
        }
    });
}
