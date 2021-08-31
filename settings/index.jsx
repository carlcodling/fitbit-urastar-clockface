import {colors, darkColors} from "./colors";
import * as util from "../common/utils";

let midColors = getDarkColors(-30);
// let darkColors = getDarkColors(-120);
//
function getDarkColors(n){
  let out = [];
  colors.forEach(function(v,i){
    out[i] = {color:util.shadeColor(v.color, n)}
  })
  return out;
}

const activities = [
  {name:"Calories",value:"calories"},
  {name:"Steps",value:"steps"},
  {name:"Floors",value:"elevationGain"},
  {name:"Distance",value:"distance"},
  {name:"Active Zone Minutes",value:"activeMinutes"}
];
const slots = [
  ['Primary Goal [Center]', 'activity1', 'color1'],
  ['2nd Goal [Top Left]', 'activity2', 'color2'],
  ['3rd Goal [Top Right]', 'activity3', 'color3'],
  ['4th Goal [Bottom Left]', 'activity4', 'color4'],
  ['5th Goal [Bottom Right]', 'activity5', 'color5']
];



function mySettings(props) {
  function setStatOrder(selectedVal, pos){
    let statList = [
      {"activity":"activity1","v":props.settingsStorage.getItem("activity1")},
      {"activity":"activity2","v":props.settingsStorage.getItem("activity2")},
      {"activity":"activity3","v":props.settingsStorage.getItem("activity3")},
      {"activity":"activity4","v":props.settingsStorage.getItem("activity4")},
      {"activity":"activity5","v":props.settingsStorage.getItem("activity5")},
    ]
    let currentStatAtPos = props.settingsStorage.getItem(pos);
    let currentPosOfSelected;
    statList.forEach(function(v,i){
      if(v.v == selectedVal){
        currentPosOfSelected = v.activity;
      }
    })
    props.settingsStorage.setItem(currentPosOfSelected, currentStatAtPos)
    props.settingsStorage.setItem(pos, selectedVal)
  }
  return (<Page>
    <Section
      title="Icon type">
      <Select
        label="Select"
        settingsKey="starTypeSelect"
        options={[
          {name:"Activity",value:"activityIcon"},
          {name:"Star",value:"star"},
          {name:"Combo",value:"combo"}
        ]}
        onSelection={(selection) => props.settingsStorage.setItem("starType", JSON.stringify(selection.values[0].value))}
      />
    </Section>
    <Section
      title="Show activity suffix?">
      <Toggle
        settingsKey="activitySuffix"
      />
    </Section>

      {slots.map(([title, activity, color]) =>
        <Section
          title={title}>
          <Select
            label="Activity Goal"
            settingsKey={`${activity}Select`}
            options={activities}
            onSelection={(selection) => setStatOrder(JSON.stringify(selection.values[0].value), activity)}
          />
          <ColorSelect
            settingsKey={color}
            colors={activity == "activity1" ? midColors:colors} />
        </Section>
      )}
      <Section
        title="Background colour">
        <ColorSelect
          settingsKey="bg"
          colors={darkColors} />
      </Section>
    </Page>)
  }
registerSettingsPage(mySettings);
