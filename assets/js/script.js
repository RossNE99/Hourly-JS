$(document).ready(function() { //Wait untill everything is loaded and then run this file
    dayjs.extend(window.dayjs_plugin_advancedFormat) //Adds functionallity from the dayjsAdvancedFormat plugin
    
    //===Displaying current date/time in header section===
    var currentDay = dayjs().format("dddd, MMMM Do - h:mma") //get current date and time in a nice format
    $("#currentDay").text(currentDay)  //add the formatted date and time to page

    var {startTime, endTime} = getLocalStorage("plannerPrefrences") //Retrive startTime and Endtime from local storage when the page is first loaded

    //===Date Picker section===
    $('#date-time-range').daterangepicker({
        timePicker: true, //add time to date range picker
        startDate: moment().startOf('hour').hour(9),    //i tried to use dayjs here but the libary wasnt having it. libary says that moment is a requirement
        endDate: moment().startOf('hour').hour(18),
        locale: {
        format: 'DD/MM/YY hh:mm A' //format for the input 
        }
    }, function(start, end, label) { //callback function to update the startTime and endTime when date/time has been chnaged in the input
        startTime = start.format("YYYY-MM-DD HH:mm:ss")
        endTime = end.format('YYYY-MM-DD HH:mm:ss')
        localStorage.setItem("plannerPrefrences", JSON.stringify({startTime, endTime})) //store new date/time range in local storage
        renderPlanner() //rerender planner to make it reflect updated time range
        });

        //===Event Listeners for day navagation section===
        $("#backADay").on("click", changeDayBtns)  //when clicked run changeDayBtns function
        $("#today").on("click", changeDayBtns)
        $("#forwardADay").on("click", changeDayBtns)
    
        function changeDayBtns(e){       // function to handel the click on one of the day navagation buttons
            var targetid = e.target.id  //get clicked button
            var startTimeObj = dayjs(startTime)  //parse dateTime strings into dayjs object
            var endTimeObj = dayjs(endTime)
            if(targetid==="backADay"){ //if back a day button is clicked
                 startTime = startTimeObj.subtract(1, 'day').format('YYYY-MM-DD H:mm:ss'); //subtract one day from start and end dates
                 endTime = endTimeObj.subtract(1, 'day').format('YYYY-MM-DD H:mm:ss');
                 localStorage.setItem("plannerPrefrences", JSON.stringify({startTime, endTime})) //update local storage to reflect chnage
                 renderPlanner() //rerender the task rows so planner shows data for the new range
            } else if(targetid==="today"){  //if today button is clicked
                startTime = dayjs().startOf('hour').set("hour", 9).format('YYYY-MM-DD H:mm:ss')
                endTime = dayjs().startOf('hour').set("hour", 18).format('YYYY-MM-DD H:mm:ss')
                localStorage.setItem("plannerPrefrences", JSON.stringify({startTime, endTime}))
                renderPlanner()

            } else if(targetid==="forwardADay"){  //if forward a day button is clicked
                startTime = startTimeObj.add(1, 'day').format('YYYY-MM-DD H:mm:ss');
                endTime = endTimeObj.add(1, 'day').format('YYYY-MM-DD H:mm:ss');
                localStorage.setItem("plannerPrefrences", JSON.stringify({startTime, endTime}))
                renderPlanner()
            }
    }

    function getLocalStorage(key){      //Function to return local storage or default data if no local strage is found. Data is key depedant
        var data = JSON.parse(localStorage.getItem(key))    
        if(key === "plannerData"){ if(!data) data = [];} //if key is plannerData and if there is no data in local storage return data as an empty arry to aviod errors
        else if(key === "plannerPrefrences"){ 
            if(!data){  //if there is no planerPrefrence in local storage then return the default range
                data = {startTime: dayjs().startOf('hour').set("hour", 9).format('YYYY-MM-DD H:mm:ss'), 
                endTime: dayjs().startOf('hour').set("hour", 18).format('YYYY-MM-DD H:mm:ss')};
            }
        } 
        return data;
    }

    function getHoursBetween(start, end) {  //Function to return an array of hour blocks between two inputted times
        const startHour = dayjs(start).startOf('hour'); //take the input time and round down to the start of the current hour
        const endHour = dayjs(end).startOf('hour');
    
        const hoursArray = []; //initialze array in the scope of this function
        let currentHour = startHour;
    
        while (currentHour.isBefore(endHour)) { //loop until there is 1 hour blocks for each hour between the inputted start and end time
        hoursArray.push(currentHour);  //add hour block to array
        currentHour = currentHour.add(1, 'hour'); //incroment 1 hour every time the loop itterates
        }
        return hoursArray; // when loop finnishes return the array containing the hour blocks
    }

    function renderPlanner() {  //Function to render the planner rows to the page
        $(".row").remove()
        $.each(getHoursBetween(startTime, endTime), function( index, time ) {  //get an array of hour blocks and create a row for each one
            var hourDiv = $("<div>", {  //create the div that displays the hour and date
                class: "hour col-1 p-3",    //add classes to that div
                text: time.format('Do MMM hA'), //add the current time and date contnet to that div
            })
            var textDivColor = dayjs().isAfter(time, 'hour') ? "past" : dayjs().isSame(time, 'hour') ? "present" : "future" //If statment to determan what color to display the text div, grey for in the past, red for current hour, and green for future
            var discriptionText =  $("<textarea>", {
                class: `description col ${textDivColor}`, //textDivColor is a dynamic class, determened by the if statement above ^
                text: getTaskDescForTime(time.unix()) //get the task description for that hour and display it in the text field
            })

            var saveButton = $("<button>", {  //create the save button
                class: "saveBtn col-1 d-flex justify-content-center align-items-center",
                "data-unixTime": time.unix(), //add unix time for that hour to each button, this will be used in the background to save and idetify the task data for each time
                html: `<i class="fas fa-save" aria-hidden="true"></i>`
            })
            
            var timeBloclkRow = $("<div>", {    //create the row div
                class: "row",
            })

            //append hourDiv, discriptionText and saveButton to the row div
            $(timeBloclkRow).append(hourDiv)
            $(timeBloclkRow).append(discriptionText)
            $(timeBloclkRow).append(saveButton)

            //then append the row div (timeBloclkRow) to the page for each hour block
            $(".container").append(timeBloclkRow)
        });
    }

    function getTaskDescForTime(time) {     //function to return the task description for a specified time
        var plannerData = getLocalStorage("plannerData")    //get the saved taks and time
        var foundTime = plannerData.find(obj => obj.hasOwnProperty(time));  //try to find the inputted time
        if (foundTime) {
          return foundTime[time];   //return the taskDescription for the found time
        } else {
          return '';    //if there has been no task found for that time then return a empty string
        }
      }

    function handelSaveIconClick(e){      //Function to save a new task or to save a edited/deleted task when the save icon is clicked
        if(!$(e.target).hasClass('saveBtn') && !$(e.target).hasClass('fa-save')) return //do nothing if it wanst a save button that was clicked
        var time;
        var taskDesc;
        if($(e.target).hasClass('saveBtn')){ time = $(e.target).attr("data-unixTime"); taskDesc = $(e.target).prev(".description").val()};  //if savebtn was clicked then get the value of the text input as taskDesc
        if($(e.target).hasClass('fa-save')){ time = $(e.target).parent().attr("data-unixTime"); taskDesc = $(e.target).parent().prev(".description").val()}; //this does the same as above ^ but if the icon is clicked
        
        var plannerData = getLocalStorage("plannerData")  //get all tasks that are currently saved

        if (taskDesc.length < 1){   //if the task description is empty then assume that the user has delete the task
            if(plannerData.find(obj => obj.hasOwnProperty(time))){  //check to see if a task description exists for that date and time
                var plannerDataWithoutDeletedTask = plannerData.filter(obj => !obj.hasOwnProperty(time));  //if it exists then create a new array exlucding that key/value pair as its pointless soting an empty string
                localStorage.removeItem("plannerData")  //clear plannerData from local storage
                localStorage.setItem("plannerData", JSON.stringify(plannerDataWithoutDeletedTask))  //save plannerData Without Deleted Task to local storage
            }
            showToast("Deleted!", `your task for ${dayjs(time).format("Do MMM hA")} has now been deleted/cleared`, `fa-trash-alt`, 'yellow') //show the user a toast to let them know the task has been deleted
            return //return null from function
        } 

        var newTask = {} //Initialise new task object
        newTask[time] = taskDesc //Format newTaks so it looks like {time: taskDesc} for example {178324200: "Task desc goes here"}
        
        var plannerDataWithEditedTask = plannerData.filter(obj => !obj.hasOwnProperty(time)); // if Key exists then the user is trying to edit a already existing task, so we will remove the object at the found time

        localStorage.setItem("plannerData", JSON.stringify([...plannerDataWithEditedTask, newTask])) //Save all the previosly added tasks and the new OR newly edited task to local storage
        showToast("Saved!", `your task: ${taskDesc}. has been saved for ${dayjs(time).format("Do MMM hA")}`, `fa-save`, 'blue') //show a toast to the user to let them know that there task has been saved
    }

    function showToast(title, message, icon, color){    //Function to show a toast(notifcation) when required
        var toast = $("<div>",{     //create the toast using html
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
        
        $("body").append(toast) //Show the toast

        setTimeout(() => {  //Hide the toast after 3 and a half secconds
            $("#toast").remove()
        },3500)
    }

    renderPlanner()  //show the planner on inital page load
    $(".container").on("click", handelSaveIconClick)    //Only one evernt handler for the rows for better preformance.
})                                                      // If i had one event hander on each button then it would result 
                                                        //in a baddd time for the user if they selected a large time range
