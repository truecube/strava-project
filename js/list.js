 ////////////////////////////////////////////////////////////////////
////////////////////// LIST ACTIVITIES SCRIPT /////////////??///////
////////////////////////////////////////////////////////////////////

let token = read_cookie(access_token_cookie_name)

//first check access_token
if(token == "" || token == "undefined") { // no access_token
    
    //if empty then check refresh token
    let refresh_token = read_cookie(refresh_token_cookie_name)
    if(refresh_token == "" || refresh_token == "undefined") { //no refresh_token

        //if empty then check code: 
        //--------- STEP 1 ------
        //GET CODE FROM THE URL
        //https://truecube.com/strava_project/exchange_token.html?code=123434fsdgf2
        //////////////////////////
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        if(code) { // not null || not empty
            document.getElementById("auth-flow").innerHTML = "Thanks for authorizing!! "
            //--------- STEP 2 ------
            //Get Access_token from Strava
            //////////////////////////
            let link = `https://www.strava.com/oauth/token?client_id=${client_id}&client_secret=${client_secret}&code=${code}&grant_type=authorization_code`
            fetch(link, {
                method: 'post'
            })
            .then(res => res.json())
            .catch(err => {
                consoleLog("Exception happeend: " + err)
            })
            .then(res => {
                write_cookie(access_token_cookie_name,res.access_token, access_token_expiry_in_days)
                write_cookie(refresh_token_cookie_name,res.refresh_token, refresh_token_expiry_in_days)
                return res
            })
            .then(res => {
                get_athlete_info(res.access_token, true)
                get_athlete_activities(res.access_token, default_activity_end_date, default_activity_start_date, true)
            })
            .catch(err => {
                consoleLog(err)
                redirect_to_homepage()
            })
        } else { // no code even - so return to authorize_page
            redirect_to_homepage();
        }
    } else { // refresh_token is available
        work_with_refresh_token(refresh_token, true, true)
    }
} else { // access_token is available
    get_athlete_info(token, true)
    get_athlete_activities(token, default_activity_end_date, default_activity_start_date, true)
}