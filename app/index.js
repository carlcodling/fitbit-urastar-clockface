import * as document from "document";

import * as util from "../common/utils";

import { FitFont } from 'fitfont'


import * as simpleActivity from "./simple/activity";
import * as simpleClock from "./simple/clock";
import * as simpleHRM from "./simple/hrm";
import * as simpleSettings from "./simple/device-settings";

// declaration of the FitFont objects
const ffTime  = new FitFont({ id:'time',  font:'Manjari_52',  halign: 'middle'})
const ffPrimaryStat  = new FitFont({ id:'ffPrimaryStat',  font:'Manjari_32',  halign: 'middle'})
const ffPrimaryTarg  = new FitFont({ id:'ffPrimaryTarg',  font:'Manjari_32',  halign: 'middle'})

// text elems
const primarySuffix = document.getElementById("primarySuffix");
const uiHR = document.getElementById("hr");

// stat star elements
const star1Arc = document.getElementById("mainStatArc");
const star1 = document.getElementById("star1");
const star2 = document.getElementById("stat2");
const star3 = document.getElementById("stat3");
const star4 = document.getElementById("stat4");
const star5 = document.getElementById("stat5");

const uiBg = document.getElementById("bg");

const txtStat2 = document.getElementById("txtStat2");
const txtStat3 = document.getElementById("txtStat3");
const txtStat4 = document.getElementById("txtStat4");
const txtStat5 = document.getElementById("txtStat5");

const SMALL_STAR_RADIUS = 40;
const RING_RADIUS = 120; // radius of the arc the stars sit on

// follow which goals, in which order, are complete
let completed_goals = [false, false, false, false, false];

let secondaryFocussed = false;


/* -------- SETTINGS -------- */
function settingsCallback(data) {
  if (!data) {
    return;
  }
  if(data.bg){
    console.log(data.bg)
    uiBg.style.fill = data.bg;
  }
  const statOrder = [
    data.activity2,
    data.activity3,
    data.activity4,
    data.activity5
    ];

  const colors = [
    data.color2,
    data.color3,
    data.color4,
    data.color5
    ];
  const starElems = [star2, star3, star4, star5];

  statOrder.forEach(function(v,i){
    setGoalCompletedStyles(
      completed_goals[i+1],
      starElems[i],
      colors[i]
    )
  })
}
simpleSettings.initialize(settingsCallback);

/* --------- CLOCK ---------- */
function clockCallback(data) {
  ffTime.text = data.time;
}
simpleClock.initialize(clockCallback);

/* -------- HRM ------------- */
function hrmCallback(data) {
  uiHR.text = `${data.bpm}`;
  if (data.zone === "out-of-range") {
    uiHR.style.fill = "#ffffff";
  } else {
    uiHR.style.fill = "orange";
  }
}
simpleHRM.initialize(hrmCallback);

/* ------- ACTIVITY --------- */
function activityCallback(data) {

  const statOrder = [
    simpleSettings.get('activity1'),
    simpleSettings.get('activity2'),
    simpleSettings.get('activity3'),
    simpleSettings.get('activity4'),
    simpleSettings.get('activity5')
    ];

  const colors = [
    simpleSettings.get('color1'),
    simpleSettings.get('color2'),
    simpleSettings.get('color3'),
    simpleSettings.get('color4'),
    simpleSettings.get('color5')
    ];

  const starElems = [star1, star2, star3, star4, star5];
  const textElems = [null,txtStat2,txtStat3,txtStat4,txtStat5];

  // apply styles the statistic arcs and associated elements
  statOrder.forEach(function(v,i){
    if(i==0){
      stylePrimaryStar(
        data[v],
        colors[0]
      )
    }
    else{
      let statusChanged = newStatusChange(data[v], i);
      if(statusChanged){
        setGoalCompletedStyles(
          (statusChanged === "completed" ? true:false) ,
          starElems[i],
          colors[i]
        )
      }
      styleSecondaryStars(
        data[v],
        starElems[i],
        textElems[i],
        colors[i]
      )
    }
  })
  // test whether the goal is complete but hasn't been registered yet
  function newStatusChange(data, pos){
    if(data.raw >= data.goal && completed_goals[pos]==false){
      completed_goals[pos] = true;
      return "completed";
    }
    else if(data.raw < data.goal && completed_goals[pos]==true){
      completed_goals[pos] = false;
      return "reset";
    }
    return false;
  }

  function styleSecondaryStars(data, elem, txtElem, hexColor){

    let arc = elem.getElementsByClassName("statArc")[0];
    let tip = elem.getElementsByClassName("arcTip")[0];
    let star = elem.getElementsByClassName("mainStar")[0];

    txtElem.text = `${data.pretty} ${data.suffixShort}`;
    var pcnt = (100/data.goal)*data.raw;
    if(pcnt>100) pcnt = 100;
    let angle = Math.round(pcnt*3.6);
    arc.sweepAngle = angle;

    if(pcnt<100){
      let coords = util.getPointOnCircle(angle+90, SMALL_STAR_RADIUS-4, SMALL_STAR_RADIUS, SMALL_STAR_RADIUS);
      tip.r = 5;
      tip.cx = coords.x;
      tip.cy = coords.y;
      // tip.style.fill = hexColor;
      //
      // arc.style.fill = hexColor;
      // star.style.fill = hexColor;
    }
    // else{
    //   tip.r = 36;
    //   tip.cx = 40;
    //   tip.cy = 40;
    //   tip.style.fill = util.shadeColor(hexColor, -10);
    //
    //   arc.style.fill = util.shadeColor(hexColor, 80);
    //   star.style.fill = util.shadeColor(hexColor, 120);
    // }
  }
}
simpleActivity.initialize(activityCallback);

// set initial positionStatStars
// TODO: hardcode positions
function positionStatStars(starElem, txtElem, angle){
  let starCoords = util.getPointOnCircle(angle, RING_RADIUS, 168, 168);
  //let styleElems = starElem.getElementsByClassName("stat");
  // var i;
  // for (i = 0; i < styleElems.length; i++) {
  //   styleElems[i].style.fill = fill;
  // }
  starElem.x = parseInt(starCoords.x)-SMALL_STAR_RADIUS;
  starElem.y = parseInt(starCoords.y)-SMALL_STAR_RADIUS+10;
  txtElem.x = parseInt(starCoords.x)-SMALL_STAR_RADIUS+40;
  txtElem.y = parseInt(starCoords.y)-SMALL_STAR_RADIUS+5;
}
positionStatStars(star2,txtStat2, 342);
positionStatStars(star3,txtStat3, 54);
positionStatStars(star4,txtStat4, 126);
positionStatStars(star5,txtStat5, 198);

document.getElementById("primaryGoal").onclick = function(){
  clearSecondaryFocus()
}
star2.onclick = function(){
  focusSecondaryGoal(2)
}
star3.onclick = function(){
  focusSecondaryGoal(3)
}
star4.onclick = function(){
  focusSecondaryGoal(4)
}
star5.onclick = function(){
  focusSecondaryGoal(5)
}

/* -------- HELPERS ------------- */
function focusSecondaryGoal(pos){
  secondaryFocussed = true;
  toggleVisibilityByClass('statContainer', 'hidden');
  toggleVisibilityByClass('txtStat', 'hidden');
}
function clearSecondaryFocus(){
  secondaryFocussed = false;
  toggleVisibilityByClass('statContainer', 'visible');
  toggleVisibilityByClass('txtStat', 'visible');
}
function stylePrimaryStar(data, color){
  var pcnt = (100/data.goal)*data.raw;
  if(pcnt>100) pcnt = 100;
  star1Arc.sweepAngle = Math.round(pcnt*3.6);
  ffPrimaryStat.text = data.pretty;
  ffPrimaryTarg.text = data.prettyGoal;
  primarySuffix.text = data.suffixLong;
  star1.style.fill = color;
  star1Arc.style.fill = util.shadeColor(color, -30);
  document.getElementById("background").style.fill = util.shadeColor(color, -100);
}
function setGoalCompletedStyles(completed, elem, hexColor){

  let arc = elem.getElementsByClassName("statArc")[0];
  let arcBg = elem.getElementsByClassName("statArcBg")[0];
  let tip = elem.getElementsByClassName("arcTip")[0];
  let star = elem.getElementsByClassName("mainStar")[0];
  //let innerStar = elem.getElementsByClassName("innerStar")[0];

  if(completed){
    tip.r = 36;
    tip.cx = 40;
    tip.cy = 40;
    tip.style.fill = util.shadeColor(hexColor, -30);
    arc.style.fill = util.shadeColor(hexColor, 80);
    star.style.fill = util.shadeColor(hexColor, 60);
    //innerStar.style.visibility = "hidden";
  }
  else{
    tip.style.fill = hexColor;
    arc.style.fill = hexColor;
    arcBg.style.fill = hexColor;
    star.style.fill = hexColor;
    //innerStar.style.visibility = "visible";
  }
}

function toggleVisibilityByClass(className, show){
  let elems = document.getElementsByClassName(className);
  var i;
  for (i = 0; i < elems.length; i++) {
    elems[i].style.visibility = show;
  }
}
