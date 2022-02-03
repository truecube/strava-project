//write cookie for name=authentication_code & value=123kaslk123
function write_cookie(name, value, expiryTimeInDays) {
    const date = new Date();
    date.setTime(date.getTime() + (expiryTimeInDays*24*60*60*1000));
    let expires = "expires="+ date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

//read the value for name = authentication_token
function read_cookie(name) {
    name = name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) { //name1=value1
        let c = ca[i]; //' ac' => 'ac'
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}