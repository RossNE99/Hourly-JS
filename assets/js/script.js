$(document).ready(function() {
    dayjs.extend(window.dayjs_plugin_advancedFormat)
    
    var currentDay = dayjs().format("dddd, MMMM Do - h:mma")
    $("#currentDay").text(currentDay)

    var {startTime, endTime} = getLocalStorage("plannerPrefrences")

    $('#date-time-range').daterangepicker({
        timePicker: true,
        startDate: moment().startOf('hour').hour(9),
        endDate: moment().startOf('hour').hour(18),
        locale: {
        format: 'DD/MM/YY hh:mm A'
        }
    }, function(start, end, label) {
        startTime = start.format("YYYY-MM-DD HH:mm:ss")
        endTime = end.format('YYYY-MM-DD HH:mm:ss')
        localStorage.setItem("plannerPrefrences", JSON.stringify({startTime, endTime}))
        renderPlanner()
        });

        $("#backADay").on("click", changeDayBtns)
        $("#today").on("click", changeDayBtns)
        $("#forwardADay").on("click", changeDayBtns)
    
        function changeDayBtns(e){
            var targetid = e.target.id
            var startTimeObj = dayjs(startTime)
            var endTimeObj = dayjs(endTime)
            if(targetid==="backADay"){
                 if(!checkIfIsSameDay()) return
                 startTime = startTimeObj.subtract(1, 'day').format('YYYY-MM-DD H:mm:ss');
                 endTime = endTimeObj.subtract(1, 'day').format('YYYY-MM-DD H:mm:ss');
                 localStorage.setItem("plannerPrefrences", JSON.stringify({startTime, endTime}))
                 renderPlanner()
            } else if(targetid==="today"){
                console.log("ttt")
                startTime = dayjs().startOf('hour').set("hour", 9).format('YYYY-MM-DD H:mm:ss')
                endTime = dayjs().startOf('hour').set("hour", 18).format('YYYY-MM-DD H:mm:ss')
                localStorage.setItem("plannerPrefrences", JSON.stringify({startTime, endTime}))
                renderPlanner()

            } else if(targetid==="forwardADay"){
                if(!checkIfIsSameDay()) return
                startTime = startTimeObj.add(1, 'day').format('YYYY-MM-DD H:mm:ss');
                endTime = endTimeObj.add(1, 'day').format('YYYY-MM-DD H:mm:ss');
                localStorage.setItem("plannerPrefrences", JSON.stringify({startTime, endTime}))
                renderPlanner()
            }

            function checkIfIsSameDay(){
                const isSameDay = startTimeObj.format('YYYY-MM-DD') === endTimeObj.format('YYYY-MM-DD');
                console.log(isSameDay)
                if(!isSameDay){
                    showToast("Error", `Only one day must be selcted to use the prev and next buttons, if you have a range set please change it to one day only`, `fa-exclamation-triangle`, `red`)
                }
                return isSameDay
            }
    }

    function getLocalStorage(key){
        var data = JSON.parse(localStorage.getItem(key))
        if(key === "plannerData"){ if(!data) data = [];}
        else if(key === "plannerPrefrences"){ if(!data) data = {startTime: dayjs().startOf('hour').set("hour", 9).format('YYYY-MM-DD H:mm:ss'), endTime: dayjs().startOf('hour').set("hour", 18).format('YYYY-MM-DD H:mm:ss')};};
        return data;
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

    function renderPlanner() {
        $(".row").remove()
        $.each(getHoursBetween(startTime, endTime), function( index, value ) {
            var hourDiv = $("<div>", {
                class: "hour col-1 p-3",
                text: value.format('Do MMM hA'),
            })
            var textDivColor = dayjs().isAfter(value, 'hour') ? "past" : dayjs().isSame(value, 'hour') ? "present" : "future"
            var discriptionText =  $("<textarea>", {
                class: `description col ${textDivColor}`,
                text: getTaskDescForTime(value.unix())
            })

            var saveButtonDiv = $("<div>", {
                class: "saveBtn col-1 d-flex justify-content-center align-items-center",
                "data-unixTime": value.unix(),
                html: `<i class="fas fa-save" aria-hidden="true"></i>`
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
        var plannerData = getLocalStorage("plannerData")
        var foundTime = plannerData.find(obj => obj.hasOwnProperty(time));
        if (foundTime) {
          return foundTime[time];
        } else {
          return '';
        }
      }

    function handelSaveIconClick(e){
        if(!$(e.target).hasClass('saveBtn') && !$(e.target).hasClass('fa-save')) return
        var time;
        var taskDesc;
        if($(e.target).hasClass('saveBtn')){ time = $(e.target).attr("data-unixTime"); taskDesc = $(e.target).prev(".description").val()};
        if($(e.target).hasClass('fa-save')){ time = $(e.target).parent().attr("data-unixTime"); taskDesc = $(e.target).parent().prev(".description").val()};
        
        var plannerData = getLocalStorage("plannerData")

        if (taskDesc.length < 1){
            if(plannerData.find(obj => obj.hasOwnProperty(time))){
                var plannerDataWithoutDeletedTask = plannerData.filter(obj => !obj.hasOwnProperty(time));
                localStorage.removeItem("plannerData")
                localStorage.setItem("plannerData", JSON.stringify(plannerDataWithoutDeletedTask))
            }
            showToast("Deleted!", `your task for ${dayjs(time).format("Do MMM hA")} has now been deleted/cleared`, `fa-trash-alt`, 'yellow')
            return
        } 

        var newTask = {}
        newTask[time] = taskDesc //Format newTaks so it looks like {time: taskDesc}
        
        var plannerDataWithEditedTask = plannerData.filter(obj => !obj.hasOwnProperty(time)); // Key exists, remove the object at the found index

        localStorage.setItem("plannerData", JSON.stringify([...plannerDataWithEditedTask, newTask])) 
        showToast("Saved!", `your task: ${taskDesc}. has been saved for ${dayjs(time).format("Do MMM hA")}`, `fa-save`, 'blue')
    }

    function showToast(title, message, icon, color){
        var toast = $("<div>",{
            id: "toast", class: "toast m-2 mt-4", role: "alert", "aria-live": "assertive", "aria-atomic":"true", style: `display: block; position: fixed; top: 0; right: 0;"`,
            html:
            `<div class="toast-header">
              <i style="color: ${color};" class="fas ${icon} m-2" aria-hidden="true"></i>
              <strong class="me-auto">${title}</strong>
              <small>Now</small>
              <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              ${message}
            </div>`
        })
        
        $("body").append(toast)

        setTimeout(() => {
            $("#toast").remove()
        },3500)
    }

    renderPlanner()
    $(".container").on("click", handelSaveIconClick)
})