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

