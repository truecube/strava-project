////////////////////////////////////////////////////////////////////
///////////////////// COMPARE ACTIVITIES SCRIPT ////////////////////
////////////////////////////////////////////////////////////////////

check_and_redirect_to_home_page(false, false)
load_activities_in_dropdown("activity_list_1")
load_activities_in_dropdown("activity_list_2")

function load_activities_in_dropdown(elementId) {
    let activities = JSON.parse(localStorage.getItem(activity_cookie_name))
    let innerHTML = "";
    for(let i=0; i < activities.length; i++) {
        let displayString = `${activities[i].name} on ` + new Date(activities[i].start_date).toLocaleString()
        innerHTML += `<li><a class="dropdown-item" onclick="set_selected(${activities[i].id}, '${displayString}', '${elementId}')">${displayString}</a></li>`
    }
    document.getElementById(elementId).innerHTML = innerHTML
}

function set_selected(id, displayString, elementId) {
    if(elementId == "activity_list_1") {
        $("#dropdownMenuButton1").html(displayString)
        $("#activity_id_1").val(id)
    } else {
        $("#dropdownMenuButton2").html(displayString)
        $("#activity_id_2").val(id)
    }
}

function do_comparison() {
    let activities = JSON.parse(localStorage.getItem(activity_cookie_name))
    const activity_id_1 = $("#activity_id_1").val()
    const activity_id_2 = $("#activity_id_2").val()
    let activity_1
    let activity_2
    for(let i = 0; i < activities.length; i++) {
        
        if(activities[i].id == activity_id_1) {
            activity_1 = activities[i]
        } 
        if(activities[i].id == activity_id_2) {
            activity_2 = activities[i]
        }

    }

    let keys = ["name", "distance", "moving_time", "type", "start_date", "average_speed", "max_speed", "average_cadence", "average_heartrate", "max_heartrate"]
    let data = []
    for(let key in keys) {
        let value = keys[key]
        data.push({
            "key": `${value}`,
            "activity_1": `${activity_1[value]}`,
            "activity_2": `${activity_2[value]}`
        })
    }
    $('#compareTable').bootstrapTable({
        data: data,
        columns: [{
          field: 'key',
          title: 'Key',
          formatter: formatName
        }, {
          field: 'activity_1',
          title: 'Activity 1',
          formatter: formatColumns
        }, {
          field: 'activity_2',
          title: 'Activity 2',
          formatter: formatColumns
        }]
      })
}