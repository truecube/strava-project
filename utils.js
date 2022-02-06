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
    window.location.href="./"
}

function get_athlete_activities(access_token, beforeDays, afterDays) {

    let before = Math.floor(getDate(beforeDays).getTime() / 1000)
    let after = Math.floor(getDate(afterDays).getTime() / 1000)
    let page = 1
    let per_page = 30

    
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
        consoleLog(res.errors)
        if(res.errors) {
            redirect_to_homepage()
        }
        return res
    })
    .then(res => load_activities(res))
}

function load_activities(data) {
    console.log(JSON.stringify(data));
}