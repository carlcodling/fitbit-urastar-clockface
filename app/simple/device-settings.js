/*
  Responsible for loading, applying and saving settings.
  Requires companion/simple/companion-settings.js
  Callback should be used to update your UI.
*/
import { me } from "appbit";
import { me as device } from "device";
import * as fs from "fs";
import * as messaging from "messaging";

import {defaultSettings} from "../../common/defaults"

const SETTINGS_TYPE = "json";
const SETTINGS_FILE = "settings.json";

let settings, onsettingschange;

export function initialize(callback) {
  settings = loadSettings();
  onsettingschange = callback;
  onsettingschange(settings);
}

export function get(key) {
  if(settings.hasOwnProperty(key)){
    return settings[key];
  }
  else{
    if(defaultSettings.hasOwnProperty(key)){
      return defaultSettings[key];
    }
    else{
      console.log("Invalid settings key");
      return null;
    }
  }
}

export function getActivityList(){
  return [
    settings['activity1'],
    settings['activity2'],
    settings['activity3'],
    settings['activity4'],
    settings['activity5']
  ]
}

export function getColorList(){
  return [
    settings['color1'],
    settings['color2'],
    settings['color3'],
    settings['color4'],
    settings['color5']
  ]
}

// Received message containing settings data
messaging.peerSocket.addEventListener("message", function(evt) {
  settings[evt.data.key] = evt.data.value;
  onsettingschange(settings);
})

// Register for the unload event
me.addEventListener("unload", saveSettings);

// Load settings from filesystem
function loadSettings() {
  if (!fs.existsSync("/private/data/"+SETTINGS_FILE)) {
      let json_data = defaultSettings;
      fs.writeFileSync(SETTINGS_FILE, json_data, SETTINGS_TYPE);
    }
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    return {};
  }
}

// Save settings to the filesystem
function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}
