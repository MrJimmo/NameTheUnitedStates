# Name the United States

> **NOTE:** This MD doc is based on comment blocks in [NameTheUnitedStates.html](NameTheUnitedStates.html) file. Lots of comments in the code explain deeper details.

<font size="8">[Play Now!](https://mrjimmo.com/NameTheUnitedStates/NameTheUnitedStates.html)</font>


## SUMMARY

This started as a simple one page game to help me memorize all 50 USA states.

Grew a bit as I explored various SVG interactions and other points of interest,
and other random things I thought up.

Click the question mark button in the game...<br>
[<img src=".\/Content/HelpButtonInputBoxCheckButton.png"/>](https://mrjimmo.com/NameTheUnitedStates/NameTheUnitedStates.html?show_help)

...to show onscreen help<br>
[<img src=".\/Content/HelpDialog.png">](https://mrjimmo.com/NameTheUnitedStates/NameTheUnitedStates.html)


## DESCRIPTION

I initially created this because I wanted to memorize all 50 states and I'd always get stuck on the last handful for some reason.  First version just had the names listed and blurred and unblurred as guesses were entered.

Because the states were initially shown blurred out and in alphabetical order, it actually provided a hint for unguessed states.  I think this kept the actual 'memorization' less effective. Early on, it was challenging, but as my memorization of the states got better, it became too much of a hint, so I ended up adding a "shuffle_states" param to increase the difficulty.

Later I added the SVG map and various other 'features' that turned it into a bit more of a 'game', and ultimately added Quiz Mode.

Even though one just has to simply view the source to learn of some intentional ways to cheat, most of these I added to aid early on development.

If you leverage one of the cheats or some other mechanism to avoid actually memorizing the states, remember kids, you are only cheating yourself :o)

It started out simple but feature creep set in as I had fun adding the various enhancements, effects and learning other things along the way.

> **NOTE:**  So far, mainly tested on Chrome and MS Edge.  Firefox renders some of the text a little off and no mobile testing yet.

## Details about URL params

["**shuffle_states**" search term in URL]
Adding "**shuffle_states**" to the URL and loading the page will shuffle the state object array. Shuffling the array causes the grid of state names to be ordered randomly. This increases the difficulty a bit if you've been relying on the alphabetical listing to give hints for missing states as you play.

["**debug**" search term in URL]
Adding "**debug**" to the URL will cause debug.js to be included
and various debug elements and debug/test functionality will be added. This was most useful during initial design/implementation.

["**hide_map**" search term in URL]
Adding "**hide_map**" to the URI, the page will be loaded with the map hidden.  This + shuffling the states is the highest difficulty.

["**quiz_mode=<quiz_type>**" search term in URL]
Adding "**quiz_mode**" to the URL, starts the game in Quiz Mode, where the target state is shown popped out of the map and with a "marching ants" type of highlight.  You must guess that states name.  The quiz takes you through all 50 states.

If <quiz_type>="random", the order of the states are picked at random.

If <quiz_type>="alphabetical" (or no type provided), the states are picked in alphabetical order.

Example URL with params:

    `NameTheUnitedStates.html?shuffle_states&hide_map&debug`

...and yes, you _could_ have "shuffle_states&hide_map&quiz_mode".  This is a secret hidden "insane" difficulty level.  Give it a try! :o)


## Debug Mode
Some buttons and a textarea are added below the map. ["Show All" button] In "Debug" mode, clicking this button will show all state names, color the states, and show the abbreviations.

["Solve Map" Button]
Jumps to the solved state, showing entire map with abbreviations and list of states unblurred (and the animation).

["Reset Map" button]
Gets the map back into initial state; unsolved, abbreviations hidden.

["Test Button"] In "Debug" mode, clicking this button runs whatever test/experiment code executed by the doTest() function. This changed over time as the page was being developed.  Click it and see what happens! :o)

Also, in debug mode:
Clicking on a state shows the state name and the abbreviation in the output textarea. Ex.  "Washington (WA)", "Oregon (OR)", etc. and also include which element the click event fired from. Ctrl+Clicking a state, will show it in the "popout" mode.

NOTE: Credit for the initial source of the map is given in a comment block above the SVG element near the bottom of this source, and has been modified for usage in this 'game', it has a license separate from the one I use for this game.


## Map Attribution
This is my first usage of something from Wikimedia, so I hope i have the attribute right.  This is from comment in NameTheUnitedStates.html file that precede the SVG tag, with a little MD formatting added:


The Map without abbreviations showing:<Br>
<img src=".\/Content/MapWithoutAbbreviations.png"/>

### Map Attribution:

This modified version of the SVG United States Map, "US State Map with modifications to support guessing game", is adapted from "File:Blank US Map With Labels.svg" by Hedgefighter, used under CC BY-SA 3.0. This version is licensed under CC BY-SA 4.0 by Jim Moore

[CC_BY-SA_3.0](https://creativecommons.org/licenses/by-sa/3.0/legalcode.en)<br>
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/legalcode.en)


Plain text copies of those licenses found in same location as this file, as [CC_BY-SA_3.0.txt](CC_BY-SA_3.0.txt) and [CC_BY-SA_4.0.txt](CC_BY-SA_4.0.txt)


The SVG Map was originally from:
https://commons.wikimedia.org/wiki/File:Blank_US_Map_With_Labels.svg

### Summary from that wikimedia page

Description:<br>
English: Map of the United States with states labeled by their abbreviations.<br>
Based off of this image: http://commons.wikimedia.org/wiki/File:Blank_US_Map.svg<br>

|||
|-:|:-|
|Date|5 June 2011|
|Source|Own work|
|Author|Hedgefighter|


### My modifications

For this game, I modified the map SVG in numerous ways:
- IDs added to several element types, to make it easier to work with in code.
- Changed colors of the lines for the smaller state fly-outs to see better.
- Removed a lot of the inkscape and sodipidi left-overs.
- Removed a lot of the other goo left over from whatever editing program(s)
  were originally used to create/edit the original file.
- Removed DC because it's not an actual state :o)
- Moved the styles for the various elements to CSS rules. This enables various
  changes to be made during the game (ex. Applying/removing "Win" animation).
- Combined the 2 separate paths for Michigan into one path, so that it can be
  addressed as a single entity via script rather than special casing.
- Also removed the one-off translate(-5.75 -6.90625) for Michigan by simply
  applying those values to the starting "m" command:
    "m x,y" (581.61931 - 5.75, 82.059006 - 6.90625)
  to become:
    "m 575.86931,75.152756" This cleared up a bug in the popout routine, which
    did not account for the extra \<g\>, and could then be removed altogether.
- Added a filter section to define glow/shadowing used as part of the visuals.
- Removed extra \<g\> wrappers that weren't doing anything and were getting in
  the way of some processing.
- Shuffled the elements around, so they would all be in alphabetical order
  based on their IDs, which in turn, have the state abbreviation as their
  suffixes. Ex. "path_WA".
- Misc. commenting, to help identify sections of elements.

> **NOTE:** This is my first significant work with SVG, so there may be some crumpled parts :o)