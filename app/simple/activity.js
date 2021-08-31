/*
  A simple way of returning activity data in the correct format based on user preferences.
  Callback should be used to update your UI.
*/
import { me } from "appbit";
import clock from "clock";
import { today, goals } from "user-activity";
import { units } from "user-settings";

import * as util from "../../common/utils";

let activityCallback;

export function initialize(callback) {
  if (me.permissions.granted("access_activity")) {
    clock.granularity = "seconds";
    clock.addEventListener("tick", tickHandler);
    activityCallback = callback;
  } else {
    console.log("Denied User Activity permission");
    callback({
      steps: getDeniedStats(),
      calories: getDeniedStats(),
      distance: getDeniedStats(),
      elevationGain: getDeniedStats(),
      activeMinutes: getDeniedStats()
    });
  }
}

let activityData = () => {
  return {
    steps: getSteps(),
    calories: getCalories(),
    distance: getDistance(),
    elevationGain: getElevationGain(),
    activeMinutes: getActiveMinutes()
  };
}

function tickHandler(evt) {
  activityCallback(activityData());
}

function getActiveMinutes() {
  let val = (today.adjusted.activeZoneMinutes.total || 0);
  let goal = (goals.activeZoneMinutes.total || 0);
  return {
    activity: "activeMinutes",
    raw: val,
    goal: goal,
    pretty: val,
    prettyGoal: goal,
    suffixShort: "mins",
    suffixLong: "Zone Minutes"
  }
}

function getCalories() {
  let val = (today.adjusted.calories || 0);
  let goal = (goals.calories || 0);
  return {
    activity: "calories",
    raw: val,
    goal: goal,
    pretty: util.numberWithCommas(val),
    prettyGoal: util.numberWithCommas(goal),
    suffixShort: "kcal",
    suffixLong: "Calories"
  }
}

function getDistance() {
  let val = (today.adjusted.distance || 0) / 1000;
  let goal = (goals.distance || 0) / 1000;
  let suffixShort = "km";
  let suffixLong = "Kilometers";
  if(units.distance === "us") {
    val *= 0.621371;
    suffixShort = "mi";
    suffixLong = "Miles";
  }
  return {
    activity: "distance",
    raw: val,
    goal: goal,
    pretty: `${val.toFixed(2)}`,
    prettyGoal: `${goal.toFixed(2)}`,
    suffixShort: suffixShort,
    suffixLong: suffixLong
  }
}

function getElevationGain() {
  let val = today.adjusted.elevationGain || 0;
  let goal = (goals.elevationGain || 0);
  return {
    activity: "elevationGain",
    raw: val,
    goal: goal,
    pretty: val,
    prettyGoal: goal,
    suffixShort: "floors",
    suffixLong: "Floors"
  }
}

function getSteps() {
  let val = (today.adjusted.steps || 0);
  let goal = (goals.steps || 0);
  return {
    activity: "steps",
    raw: val,
    goal: goal,
    pretty: util.numberWithCommas(val),
    prettyGoal: util.numberWithCommas(goal),
    suffixShort: "steps",
    suffixLong: "Steps"
  }
}

function getDeniedStats() {
  return {
    raw: 0,
    goal: 0,
    pretty: "Denied",
    suffixShort: "",
    suffixLong: ""
  }
}
