//Adhithya's
const client_id = 76724;
const client_secret = '68bbb0b199fdfa96891031d0b91a6fb2f3973adc';

//TheBestDad's
// const client_id = 73172;
// const client_secret = 'e61fba5596fa4b374d77cfd71d501fcb2f7b583e';

//other global variables
const refresh_token_expiry_in_days=30
const access_token_expiry_in_days=1

const environment = "dev" // "stage", "beta", "prod"

function consoleLog(message) {
    if(environment == "prod") {
        //not going to log it - since it is production
    } else {
        console.log(message)
    }
}