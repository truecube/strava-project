//if you want to getDate in the past - pass negative number
//if you want to getDate in the future - pass positive number
function getDate(numberOfDaysAfter) {
    const date = new Date()
    date.setTime(date.getTime() + (numberOfDaysAfter*24*60*60*1000))
    return date
}

//write cookie for name=authentication_code & value=123kaslk123
function write_cookie(name, value, expiryTimeInDays) {
    let date = getDate(expiryTimeInDays)
    let expires = "expires="+ date.toUTCString()
    document.cookie = name + "=" + value + ";" + expires + ";path=/"
}

function write_to_local_storage(name, value) {
    window.localStorage.setItem(name, value)
}

function read_from_local_storage(name) {
    return window.localStorage.getItem(name)
}

function check_and_redirect_to_home_page(displayAthleteInfo, displayAthleteActivities) {
    let at = read_cookie(access_token_cookie_name)
    if(at) {
        get_athlete_activities(at, default_activity_end_date, default_activity_start_date, false)
        return true
    } else {
        let rt = read_cookie(refresh_token_cookie_name)
        if(rt) {
            work_with_refresh_token(rt, displayAthleteInfo, displayAthleteActivities)
            return true
        } else {
            redirect_to_homepage()
        }
    }
}

function work_with_refresh_token(refresh_token, displayAthleteInfo, displayAthleteActivities) {
    let link=`https://www.strava.com/api/v3/oauth/token?client_id=${client_id}&client_secret=${client_secret}&refresh_token=${refresh_token}&grant_type=refresh_token`
    fetch(link, {
        method:'POST'
    })
    .then(res => res.json())
    .catch(ex => consoleLog("Exception happened " + ex))
    .then(res => {
        write_cookie(access_token_cookie_name, res.access_token, access_token_expiry_in_days)
        write_cookie(refresh_token_cookie_name, res.refresh_token, refresh_token_expiry_in_days)
        return res
    })
    .then(res => {
        get_athlete_info(res.access_token, displayAthleteInfo)
        get_athlete_activities(res.access_token, default_activity_end_date, default_activity_start_date, displayAthleteActivities)
    })
    .catch(ex => {
        consoleLog("Exception happened " + ex)
        redirect_to_homepage()
    })
}

//read the value for name = authentication_token
function read_cookie(name) {
    name = name + "="
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    for(let i = 0; i < ca.length; i++) { //name1=value1
        let c = ca[i]; //' ac' => 'ac'
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ""
}

function redirect_to_homepage() {
    write_cookie(refresh_token_cookie_name, "", -1)
    write_cookie(access_token_cookie_name, "", -1)
    localStorage.clear()
    window.location.href="./"
}


function get_athlete_info(access_token, display) {
    let link="https://www.strava.com/api/v3/athlete"
    fetch(link, {
        method:'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(res => res.json())
    .then(res => {
        consoleLog(res.errors)
        if(res.errors) {
            redirect_to_homepage()
        }
        return res
    })
    .then(res => {
        if(display) {
            load_data(res)
        }
    })
    .catch(error => {
        consoleLog(error)
        redirect_to_homepage()
    })
}

function load_data(data) {
    let dataHTML = "<table>"
    dataHTML += `<tr><th>FirstName</th><td>${data.firstname}</td></tr>`
    dataHTML += `<tr><th>LastName</th><td>${data.lastname}</td></tr>`
    dataHTML += `<tr><th>Gender</th><td>${data.sex}</td></tr>`
    dataHTML += `<tr><th>City</th><td>${data.city}</td></tr>`
    dataHTML += `<tr><th>State</th><td>${data.state}</td></tr>`
    dataHTML += `<tr><th>ProfilePic</th><td><img src='${data.profile}'/></td></tr>`
    dataHTML += `</table>`
    $('#athelete_info').html(dataHTML)
}

function get_athlete_activities(access_token, beforeDays, afterDays, display, isForceFetch=false) {
    if(access_token == "") {
        access_token = read_cookie(access_token_cookie_name)
    }
    let localActivities = read_from_local_storage(activity_cookie_name)
    let lastFetchTime = read_from_local_storage(last_fetch_time_name)
    let fiveHoursAfter = parseInt(lastFetchTime) + allowed_time_to_live_for_activities
    
    if(isForceFetch == false && localActivities && fiveHoursAfter >= new Date().getTime()) {
        localActivities = JSON.parse(localActivities)
        load_activities(localActivities)
    } else {
        let before = Math.floor(getDate(beforeDays).getTime() / 1000)
        let after = Math.floor(getDate(afterDays).getTime() / 1000)
        let page = 1
        let per_page = 100

        let link = `https://www.strava.com/api/v3/athlete/activities?before=${before}&after=${after}&page=${page}&per_page=${per_page}`
        console.log(link)
        fetch(link, {
            method:'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(res => res.json())
        .then(res => {
            if(res.errors) {
                redirect_to_homepage()
            }
            return res
        })
        .then(res => {
            write_to_local_storage(activity_cookie_name, JSON.stringify(res))
            write_to_local_storage(last_fetch_time_name, new Date().getTime())
            if(display) {
                load_activities(res)
            }
        })
    }
}

function load_activities(data) {
    $('#table').bootstrapTable("destroy")
    $('#table').bootstrapTable({
        data: data,
        pagination: true,
        search: true,
        columns: [{
          field: 'name',
          title: 'Name',
          formatter: formatName
        }, {
          field: 'distance',
          title: 'Distance',
          formatter: formatDistance
        }, {
          field: 'start_date',
          title: 'Start Date',
          formatter: formatDate
        }, {
            field: 'average_heartrate',
            title: 'Average Heart Rate',
            formatter: formatHeartRate
        }]
      })
    return data
}

function formatHeartRate(value) {
    return Math.floor(value) + " bpm"
}

function formatDistance(value) {
    return (value * 0.000621371192).toFixed(2) + " miles"
}

function formatTime(valueInSeconds) {
    return Math.floor(valueInSeconds / 60) + " minutes"
}

function formatDate(value) {
    return new Date(value).toLocaleString()
}

function formatName(value) {
    value = value[0].toUpperCase() + value.substring(1);
    return value.replace("_", " ")
}

function formatColumns(value, row) {
    if(row.key == "distance") {
        return formatDistance(value)
    } else if(row.key == "average_heartrate" || row.key == "max_heartrate") {
        return formatHeartRate(value)
    } else if(row.key == "moving_time") {
        return formatTime(value)
    } else if(row.key == "start_date") {
        return formatDate(value)
    } else if(row.key == "average_cadence") {
        return Math.floor(value * 2) + " spm"
    } else {
        return value
    }
}