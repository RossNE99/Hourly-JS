dayjs.extend(window.dayjs_plugin_advancedFormat)
var currentDay = dayjs().format("dddd, MMMM Do")

$("#currentDay").text(currentDay)

function getHoursBetween(start, end) {
    const startHour = dayjs(start).startOf('hour');
    const endHour = dayjs(end).startOf('hour');
  
    const hoursArray = [];
    let currentHour = startHour;
  
    while (currentHour.isBefore(endHour)) {
      hoursArray.push(currentHour);
      currentHour = currentHour.add(1, 'hour');
    }
  
    return hoursArray;
  }

const startTime = '2024-01-20 09:00:00'; //this will be replaced, only for testing
const endTime = '2024-01-20 17:00:00';  //this will be replaced, only for testing

function renderPlanner() {
    $.each(getHoursBetween(startTime, endTime), function( index, value ) {
        var hourDiv = $("<div>", {
            class: "hour col-1",
            text: value.format('hA')
        })
        var textDivColor = dayjs().isAfter(value, 'hour') ? "past" : dayjs().isSame(value, 'hour') ? "present" : "future"
        var discriptionText =  $("<textarea>", {
            class: `description col ${textDivColor}`,
            text: ""
        })

        var saveButtonDiv = $("<div>", {
            class: "saveBtn col-1"
        })
        
        var timeBloclkRow = $("<div>", {
            class: "row",
        })

        $(timeBloclkRow).append(hourDiv)
        $(timeBloclkRow).append(discriptionText)
        $(timeBloclkRow).append(saveButtonDiv)

        $(".container").append(timeBloclkRow)
    });
}

renderPlanner()