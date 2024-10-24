/*
StateObject.js

This file contains the main StateObject class definition.
It also handles initializing the global list of StateObjects.
*/

var g_all_united_states = [];

/*
StateObject

This class defines the State Object used throughout the game.
*/
class StateObject {
    constructor(name, abbreviation) {
        this.state_name         = name;         // "Washington"
        this.state_abbreviation = abbreviation; // "WA"
        this.solved             = false;
        this.stateDIV           = null;         // State Name lives in this Div

        // This becomes true if/when the user chooses to get a hint.
        // See revealLetter method for more info.
        this.namesplit          = false;
    }

    /*
    This function handles setting the "Solved" state for the object.
    Each state is represented by a DIV with 2 SPAN elements.
    The stateDIV property is the DIV that contains 2 SPAN elements, one that
    shows any revealed characters unblurred, and the second one has the
    remaining characters blurred.
    */
    solve() {
        this.solved = true;
        var blurredSpans = this.stateDIV.querySelectorAll(
            '.state-name-span-blurred');
        blurredSpans.forEach( (span) => {
            if (span?.classList.contains('state-name-span-blurred')) {
                span.classList.remove('state-name-span-blurred');
            }
        });
    }

    /*
    This function handles revealing one letter of the state name.
    The basic approach is on the first letter to be revealed, the entire name
    is split into separate DIVs for each letter.   This allows selectively
    removing the blur effect and allows unblurring a random letter at a time.

    Might seem a little wasteful to create per char DIVs, but it's not
    expected that users will be doing this that often, and at worse, you end up
    with 422 DIVs (total number chars for all 50 states), instead of the
    original 50.
    */
    revealLetter() {
        // If we haven't split the DIV up into individual blurred characters,
        // do so now in preparation for unblurring one char at a time.
        var blurredSpans = this.stateDIV.querySelectorAll(
            '.state-name-span-blurred');
        if ((blurredSpans.length == 1) && (!this.namesplit)) {
            // First remove the existing nodes (should only be 2),
            // One blurring all letters, the other empty but non-blurred.
            this.stateDIV.innerHTML = "";

            // Now create blurred spans for each letter of the state name
            for (var c = 0; c < this.state_name.length; c++) {
                var newSpan = document.createElement('span');
                newSpan.innerText = this.state_name[c];
                newSpan.id = `span_state_${this.state_abbreviation}_`+
                    `${newSpan.innerText}` ;
                newSpan.classList.add('state-name-span-font');
                newSpan.classList.add('state-name-span-blurred');
                this.stateDIV.appendChild(newSpan);
            }

            // Get the updated collection of blurred DIV now that we've created
            // one for each char.
            blurredSpans = this.stateDIV.querySelectorAll(
                '.state-name-span-blurred');
            this.namesplit = true;
        }

        // Now unblur a random number (or skip if all have been unblurred)
        if (blurredSpans.length >= 1) {
            blurredSpans[rndInt(0,blurredSpans.length-1)].classList.remove(
                'state-name-span-blurred');
        }
    }
}

/*
Array of States and their abbreviations, used in creating the main StateObject
array.  States are in alphabetical order, which easily enables the
Alphabetical Quiz Type.
*/
united_states_names_and_abbreviations =
[
  {
    "name"         : "Alabama",
    "abbreviation" : "AL"
  },
  {
    "name"         : "Alaska",
    "abbreviation" : "AK"
  },
  {
    "name"         : "Arizona",
    "abbreviation" : "AZ"
  },
  {
    "name"         : "Arkansas",
    "abbreviation" : "AR"
  },
  {
    "name"         : "California",
    "abbreviation" : "CA"
  },
  {
    "name"         : "Colorado",
    "abbreviation" : "CO"
  },
  {
    "name"         : "Connecticut",
    "abbreviation" : "CT"
  },
  {
    "name"         : "Delaware",
    "abbreviation" : "DE"
  },
  {
    "name"         : "Florida",
    "abbreviation" : "FL"
  },
  {
    "name"         : "Georgia",
    "abbreviation" : "GA"
  },
  {
    "name"         : "Hawaii",
    "abbreviation" : "HI"
  },
  {
    "name"         : "Idaho",
    "abbreviation" : "ID"
  },
  {
    "name"         : "Illinois",
    "abbreviation" : "IL"
  },
  {
    "name"         : "Indiana",
    "abbreviation" : "IN"
  },
  {
    "name"         : "Iowa",
    "abbreviation" : "IA"
  },
  {
    "name"         : "Kansas",
    "abbreviation" : "KS"
  },
  {
    "name"         : "Kentucky",
    "abbreviation" : "KY"
  },
  {
    "name"         : "Louisiana",
    "abbreviation" : "LA"
  },
  {
    "name"         : "Maine",
    "abbreviation" : "ME"
  },
  {
    "name"         : "Maryland",
    "abbreviation" : "MD"
  },
  {
    "name"         : "Massachusetts",
    "abbreviation" : "MA"
  },
  {
    "name"         : "Michigan",
    "abbreviation" : "MI"
  },
  {
    "name"         : "Minnesota",
    "abbreviation" : "MN"
  },
  {
    "name"         : "Mississippi",
    "abbreviation" : "MS"
  },
  {
    "name"         : "Missouri",
    "abbreviation" : "MO"
  },
  {
    "name"         : "Montana",
    "abbreviation" : "MT"
  },
  {
    "name"         : "Nebraska",
    "abbreviation" : "NE"
  },
  {
    "name"         : "Nevada",
    "abbreviation" : "NV"
  },
  {
    "name"         : "New Hampshire",
    "abbreviation" : "NH"
  },
  {
    "name"         : "New Jersey",
    "abbreviation" : "NJ"
  },
  {
    "name"         : "New Mexico",
    "abbreviation" : "NM"
  },
  {
    "name"         : "New York",
    "abbreviation" : "NY"
  },
  {
    "name"         : "North Carolina",
    "abbreviation" : "NC"
  },
  {
    "name"         : "North Dakota",
    "abbreviation" : "ND"
  },
  {
    "name"         : "Ohio",
    "abbreviation" : "OH"
  },
  {
    "name"         : "Oklahoma",
    "abbreviation" : "OK"
  },
  {
    "name"         : "Oregon",
    "abbreviation" : "OR"
  },
  {
    "name"         : "Pennsylvania",
    "abbreviation" : "PA"
  },
  {
    "name"         : "Rhode Island",
    "abbreviation" : "RI"
  },
  {
    "name"         : "South Carolina",
    "abbreviation" : "SC"
  },
  {
    "name"         : "South Dakota",
    "abbreviation" : "SD"
  },
  {
    "name"         : "Tennessee",
    "abbreviation" : "TN"
  },
  {
    "name"         : "Texas",
    "abbreviation" : "TX"
  },
  {
    "name"         : "Utah",
    "abbreviation" : "UT"
  },
  {
    "name"         : "Vermont",
    "abbreviation" : "VT"
  },
  {
    "name"         : "Virginia",
    "abbreviation" : "VA"
  },
  {
    "name"         : "Washington",
    "abbreviation" : "WA"
  },
  {
    "name"         : "West Virginia",
    "abbreviation" : "WV"
  },
  {
    "name"         : "Wisconsin",
    "abbreviation" : "WI"
  },
  {
    "name"         : "Wyoming",
    "abbreviation" : "WY"
  }
];

// initialize the global array of State objects.
united_states_names_and_abbreviations.forEach( (e) => {
    g_all_united_states.push(new StateObject(e.name, e.abbreviation));
});