const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
require('dotenv').config()

const app = express()
const port = 3000

app.set("view engine", "ejs")
app.use(express.static(`${__dirname}/public`))
app.use(bodyParser.urlencoded({ extended: true }))


// The sunrise and sunset time response from the API is in Unix format
// This function converts it into local time and fetches the hour and minute.
convertUnixTimestamp = (unix_timestamp) => {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unix_timestamp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    // var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    var formattedTime = hours + ':' + minutes.substr(-2);
    return formattedTime
}


getWindDirection = (data) => {
    let windIsMovingTowards, windDirection;

    direction = (value) => {

        if (value >= 0 && value <= 90) return "NE"
        if (value >= 91 && value <= 180) return "SE"
        if (value >= 181 && value <= 270) return "SW"
        if (value >= 270 && value <= 360) return "SW"

    }

    if (data >= 180) {
        windIsMovingTowards = data - 180 
        windDirection = direction(windIsMovingTowards)
    } else {
        windIsMovingTowards = data + 180
        windDirection = direction(windIsMovingTowards)
    }

    return windDirection
}

var city = "Ibadan"
var units = "metric"


app.get("/", (req, res) => {    
   
    
    const appid = process.env.API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${appid}&units=${units}`

    axios.get(url)
    .then(function (response) {
        // handle success
        const weatherData = response.data
        const description = weatherData.weather[0].description
        const icon = weatherData.weather[0].icon
        const temperature = weatherData.main.temp
        const tempFeelsLike = weatherData.main.feels_like
        const humidity = weatherData.main.humidity
        const country = weatherData.sys.country
        const cityName = weatherData.name
        const visibility = weatherData.visibility / 1000 // in kilometers
        const windSpeed = weatherData.wind.speed
        const windDegree = weatherData.wind.deg
        const windDirection = getWindDirection(windDegree)
        const sunrise = convertUnixTimestamp(weatherData.sys.sunrise)
        const sunset = convertUnixTimestamp(weatherData.sys.sunset)
        const imgIcon = weatherData.weather[0].icon
        const imageURL = `http://openweathermap.org/img/wn/${imgIcon}@2x.png`

        res.render("index", {
            title: "Weather App",
            desc: description,
            ico: icon,
            temp: temperature,
            tFeelsLike: tempFeelsLike,
            hum: humidity,
            cou: country,
            ctName: cityName,
            visi: visibility,
            wSpeed: windSpeed,
            wDegree: windDegree,
            wDirection: windDirection,
            sunR: sunrise,
            sunS: sunset,
            imgLink: imageURL
        })

    })
    .catch(function (error) {
        if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers)
        } else if (error.request) {
            console.log(error.request)
        } else {
            console.log('Error', error.message);
        }
        console.log(error.config)
    })
    .then(function () {
        // always executed
    });
})


app.post("/", (req, res) => {
    
    city = req.body.city
    res.redirect("/")

})


app.post("/unit", (req, res) => {
    const metricSys = req.body.metricBtn
    const imperialSys = req.body.imperialBtn
    
    if (metricSys) units = metricSys
    if (imperialSys) units = imperialSys

    res.redirect("/")   

})


app.listen(process.env.PORT || port, ()=> console.log(`listening on port ${port}`))