$(document).ready(function() {
    dayjs.extend(window.dayjs_plugin_advancedFormat)
    var currentDay = dayjs().format("dddd, MMMM Do")

    $("#currentDay").text(currentDay)

    function getPlannerData(){
        var plannerData = JSON.parse(localStorage.getItem("plannerData"))
        if (!plannerData) plannerData = []
        return plannerData
    }

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

    const startTime = '2024-01-21 09:00:00'; //this will be replaced, only for testing
    const endTime = '2024-01-21 17:00:00';  //this will be replaced, only for testing

    function renderPlanner() {
        $.each(getHoursBetween(startTime, endTime), function( index, value ) {
            var hourDiv = $("<div>", {
                class: "hour col-1",
                text: value.format('hA'),
            })
            var textDivColor = dayjs().isAfter(value, 'hour') ? "past" : dayjs().isSame(value, 'hour') ? "present" : "future"
            var discriptionText =  $("<textarea>", {
                class: `description col ${textDivColor}`,
                text: getTaskDescForTime(value.unix())
            })

            var saveButtonDiv = $("<div>", {
                class: "saveBtn col-1",
                "data-unixTime": value.unix()
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

    function getTaskDescForTime(time) {
        var plannerData = getPlannerData()
        var foundTime = plannerData.find(obj => obj.hasOwnProperty(time));
        if (foundTime) {
          return foundTime[time];
        } else {
          return '';
        }
      }

    function handelSaveIconClick(e){
        if(!$(e.target).hasClass('saveBtn')) return
        var time = $(e.target).attr("data-unixTime")
        var taskDesc = $(e.target).prev(".description").val()
        var plannerData = getPlannerData()

        if (taskDesc.length < 1){
            if(plannerData.find(obj => obj.hasOwnProperty(time))){
                var plannerDataWithoutDeletedTask = plannerData.filter(obj => !obj.hasOwnProperty(time));
                localStorage.removeItem("plannerData")
                localStorage.setItem("plannerData", JSON.stringify(plannerDataWithoutDeletedTask))
            }
            return
        } 

        var newTask = {}
        newTask[time] = taskDesc //Format newTaks so it looks like {time: taskDesc}
        
        var plannerDataWithEditedTask = plannerData.filter(obj => !obj.hasOwnProperty(time)); // Key exists, remove the object at the found index

        localStorage.setItem("plannerData", JSON.stringify([...plannerDataWithEditedTask, newTask])) 
    }

    renderPlanner()
    $(".container").on("click", handelSaveIconClick)
})