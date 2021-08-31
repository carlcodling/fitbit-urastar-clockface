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

const primaryIcon = document.getElementById("primaryIcon");

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

let currentLoadedGoals = [
  {goal:0, raw:0},
  {goal:0, raw:0},
  {goal:0, raw:0},
  {goal:0, raw:0},
  {goal:0, raw:0}
]

/* -------- SETTINGS -------- */
function settingsCallback(data) {
  if (!data) {
    return;
  }
  if(data.bg){
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
    styleSecondaryStar(
      completed_goals[i+1],
      starElems[i],
      colors[i]
    )
    setIconType(starElems[i],v)
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

  let statOrder = simpleSettings.getActivityList();
  let colors = simpleSettings.getColorList();

  if(secondaryFocussed){
    loadPrimaryGoalData(data[statOrder[secondaryFocussed]]);
    return
  }

  const starElems = [star1, star2, star3, star4, star5];
  const textElems = [null,txtStat2,txtStat3,txtStat4,txtStat5];

  // apply styles the statistic arcs and associated elements
  statOrder.forEach(function(v,i){
    if(i==0){
      loadPrimaryGoalData(data[v]);
      stylePrimaryStar(
        colors[0]
      )
    }
    else{
      //let statusChanged = hasStatusChanged(data[v], i);
      let changed = hasDataChanged(data[v], i);
      if(changed.completedStatus){
        styleSecondaryStar(
          (changed.completedStatus === "completed" ? true:false) ,
          starElems[i],
          colors[i]
        )
      }
      if(changed.data){
        loadSecondaryGoalData(
          data[v],
          starElems[i],
          textElems[i],
          colors[i]
        )
      }
    }
  })
  // has data for this position changed since last run?
  function hasDataChanged(data, i){
    let out = {"data":false, "completedStatus":false}
    if(data.raw != currentLoadedGoals.raw || data.goal != currentLoadedGoals.goal){
      out.data = true;
      currentLoadedGoals.raw = data.raw;
      currentLoadedGoals.goal = data.goal;
    }
    if(data.raw >= data.goal && completed_goals[i]==false){
      completed_goals[i] = true;
      out.completedStatus = "completed";
    }
    else if(data.raw < data.goal && completed_goals[i]==true){
      completed_goals[i] = false;
      out.completedStatus =  "reset";
    }
    return out;
  }

  function loadPrimaryGoalData(data){
    var pcnt = (100/data.goal)*data.raw;
    if(pcnt>100) pcnt = 100;
    star1Arc.sweepAngle = Math.round(pcnt*3.6);
    ffPrimaryStat.text = data.pretty;
    ffPrimaryTarg.text = data.prettyGoal;
    primarySuffix.text = data.suffixLong;
    let activity = simpleSettings.get("activity1");
    primaryIcon.href = `img/${activity}Circ.png`;
  }

  function loadSecondaryGoalData(data, elem, txtElem, hexColor){

    let arc = elem.getElementsByClassName("statArc")[0];
    let tip = elem.getElementsByClassName("arcTip")[0];
    let star = elem.getElementsByClassName("mainStar")[0];

    //txtElem.text = `${data.pretty} ${data.suffixShort}`;
    let txt = `${data.pretty} `;
    if(simpleSettings.get("activitySuffix")){
      txt += data.suffixShort;
    }
    txtElem.text = txt;
    var pcnt = (100/data.goal)*data.raw;
    if(pcnt>100) pcnt = 100;
    let angle = Math.round(pcnt*3.6);
    arc.sweepAngle = angle;

    if(pcnt<100){
      let coords = util.getPointOnCircle(angle+90, SMALL_STAR_RADIUS-4, SMALL_STAR_RADIUS, SMALL_STAR_RADIUS);
      tip.r = 5;
      tip.cx = coords.x;
      tip.cy = coords.y;
    }
  }
}
simpleActivity.initialize(activityCallback);

// set initial positionStatStars
// TODO: hardcode positions
function positionStatStars(starElem, txtElem, angle){
  let starCoords = util.getPointOnCircle(angle, RING_RADIUS, 168, 168);

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
  focusSecondaryGoal(1)
}
star3.onclick = function(){
  focusSecondaryGoal(2)
}
star4.onclick = function(){
  focusSecondaryGoal(3)
}
star5.onclick = function(){
  focusSecondaryGoal(4)
}

/* -------- HELPERS ------------- */
function focusSecondaryGoal(pos){
  let colors = simpleSettings.getColorList();
  secondaryFocussed = pos;
  toggleVisibilityByClass('statContainer', 'hidden');
  toggleVisibilityByClass('txtStat', 'hidden');
  toggleVisibilityByClass('heart', 'hidden');
  ffTime.style.visibility = "hidden";

  stylePrimaryStar(
    colors[pos]
  )
}
function clearSecondaryFocus(){
  let colors = simpleSettings.getColorList();
  secondaryFocussed = false;
  toggleVisibilityByClass('statContainer', 'visible');
  toggleVisibilityByClass('txtStat', 'visible');
  toggleVisibilityByClass('heart', 'visible');
  ffTime.style.visibility = "visible";
  stylePrimaryStar(
    colors[0]
  )
}
function stylePrimaryStar(color){
  star1.style.fill = color;
  star1Arc.style.fill = util.shadeColor(color, -30);
  document.getElementById("background").style.fill = util.shadeColor(color, -120);
}
function styleSecondaryStar(completed, elem, hexColor){

  let arc = elem.getElementsByClassName("statArc")[0];
  let arcBg = elem.getElementsByClassName("statArcBg")[0];
  let tip = elem.getElementsByClassName("arcTip")[0];
  let star = elem.getElementsByClassName("mainStar")[0];

  if(completed){
    tip.r = 36;
    tip.cx = 40;
    tip.cy = 40;
    tip.style.fill = util.shadeColor(hexColor, -30);
    arc.style.fill = util.shadeColor(hexColor, 80);
    star.style.fill = util.shadeColor(hexColor, 60);
  }
  else{
    tip.style.fill = hexColor;
    arc.style.fill = hexColor;
    arcBg.style.fill = hexColor;
    star.style.fill = hexColor;
  }
}

function setIconType(elem, activity){
  let icon = simpleSettings.get("starType");
  let star = elem.getElementsByClassName("mainStar")[0];
  if(icon == "activityIcon"){
    star.href = `img/${activity}Circ.png`;
  }
  else if(icon == "star"){
    star.href = `img/starSmall.png`;
  }
  else if(icon == "combo"){
    star.href = `img/${activity}Star.png`;
  }
}


function toggleVisibilityByClass(className, show){
  let elems = document.getElementsByClassName(className);
  var i;
  for (i = 0; i < elems.length; i++) {
    elems[i].style.visibility = show;
  }
}
