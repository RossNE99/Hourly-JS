dayjs.extend(window.dayjs_plugin_advancedFormat)
var currentDay = dayjs().format("dddd, MMMM Do")

$("#currentDay").text(currentDay)