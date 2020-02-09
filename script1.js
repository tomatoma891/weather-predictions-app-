$(document).ready(function () {
    let test = false;

    const apiKey = "166a433c57516f51dfab1f7edaed8413";
    let url = 'https://api.openweathermap.org/data/2.5/';
    let requestType = "";
    let query = "";
    showHistory();

    // pull current location
    $('#getWeather,#past-cities').on('click', function () {
        if (test) console.log("on click");
        // get location from user input box
        let userInput = $(event.target)[0];
        let location = "";

        if (userInput.id === "getWeather" || userInput.id === "getWeatherId") {
            if (test) console.log("getWeather");
            location = $('#city-search').val().trim().toUpperCase();
        } else if (userInput.className === ("cityList")) {
            if (test) console.log("cityList");
            location = userInput.innerText;
        }
        if (test) { console.log('location:' + location); }
        if (location == "") return;


        updateCityStore(location);
        getCurWeather(location);
        getForecastWeather(location);
    });

    function convertDate(epoch) {
        // function to convert unix epoch to local time
        // returns arr ["MM/DD/YYYY, HH:MM:SS AM", "MM/DD/YYYY", "HH:MM:SS AM"]
        if (test) { console.log(`convertData - epoch: ${epoch}`); }
        let readable = [];
        let myDate = new Date(epoch * 1000);

        // local time
        // returns string "MM/DD/YYYY, HH:MM:SS AM"
        readable[0] = (myDate.toLocaleString());
        readable[1] = ((myDate.toLocaleString().split(", "))[0]);
        readable[2] = ((myDate.toLocaleString().split(", "))[1]);

        if (test) { console.log(` readable[0]: ${readable[0]}`); }
        return readable;
    }

    function getCurWeather(loc) {
        // function to get current weather
        // returns object of current weather data
        if (test) { console.log("getCurWeather - loc:", loc); }
        if (test) { console.log("getCurWeather - toloc:", typeof loc); }

        // clear search field
        $('#city-search').val("");

        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
            city = `q=${loc}`;
        }

        // set queryURL based on type of query
        requestType = 'weather';
        query = `?${city}&units=imperial&appid=${apiKey}`;
        queryURL = `${url}${requestType}${query}`;

        if (test) console.log(`cur queryURL: ${queryURL}`);
        // Create an AJAX call to retrieve data Log the data in console
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (response) {
            if (test) console.log(response);

            weatherObj = {
                city: `${response.name}`,
                wind: response.wind.speed,
                humidity: response.main.humidity,
                temp: response.main.temp,
                date: (convertDate(response.dt))[1],
                icon: `http://openweathermap.org/img/w/${response.weather[0].icon}.png`,
                desc: response.weather[0].description
            }

            // calls function to draw results to page
            showCurWeather(weatherObj);

        });
    };

    function getForecastWeather(loc) {
        // function to get 5 day forecast data
        // returns array of daily weather objects
        if (test) { console.log("getForecastWeather - loc:", loc); }



        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
            city = `q=${loc}`;
        }

        // array to hold all the days of results
        let weatherArr = [];
        let weatherObj = {};

        // set queryURL based on type of query
        requestType = 'forecast/daily';
        query = `?${city}&cnt=6&units=imperial&appid=${apiKey}`;
        queryURL = `${url}${requestType}${query}`;

        // Create an AJAX call to retrieve data Log the data in console
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (response) {
            if (test) console.log("getForecast response", response);

            for (let i = 1; i < response.list.length; i++) {
                let cur = response.list[i]
                // TODO check for errors/no data
                weatherObj = {
                    weather: cur.weather[0].description,
                    icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
                    minTemp: cur.temp.min,
                    maxTemp: cur.temp.max,
                    humidity: cur.humidity,
                    date: (convertDate(cur.dt))[1]
                };

                weatherArr.push(weatherObj);
            }

            showForecast(weatherArr);
        });
    };

    function showCurWeather(cur) {
        // function to show weather all days
        if (test) { console.log('drawCurWeather - cur:', cur); }

        $('#forecast').empty();
        $('#cityName').text(cur.city + " (" + cur.date + ")");
        $('#curWeathIcn').attr("src", cur.icon);
        $('#curTemp').text("Temp: " + cur.temp + " F");
        $('#curHum').text("Humidity: " + cur.humidity + "%");
        $('#curWind').text("Windspeed: " + cur.wind + " MPH");
    };

    function showForecast(cur) {
        if (test) { console.log('drawForecast - cur:', cur); }

        for (let i = 0; i < cur.length; i++) {
            let $colmx1 = $('<div class="col mx-1">');
            let $cardBody = $('<div class="card-body forecast-card">');
            let $cardTitle = $('<h5 class="card-title">');
            $cardTitle.text(cur[i].date);


            let $ul = $('<ul>');

            let $iconLi = $('<li>');
            let $iconI = $('<img>');
            $iconI.attr('src', cur[i].icon);

            let $weathLi = $('<li>');
            $weathLi.text(cur[i].weather);

            let $tempMinLi = $('<li>');
            $tempMinLi.text('Min Temp: ' + cur[i].minTemp + " F");

            let $tempMaxLi = $('<li>');
            $tempMaxLi.text('Max Temp: ' + cur[i].maxTemp + " F");

            let $humLi = $('<li>');
            $humLi.text('Humidity: ' + cur[i].humidity + "%");

            // assemble element
            $iconLi.append($iconI);

            $ul.append($iconLi);
            $ul.append($weathLi);
            $ul.append($tempMinLi);
            $ul.append($tempMaxLi);
            $ul.append($humLi);

            $cardTitle.append($ul);
            $cardBody.append($cardTitle);
            $colmx1.append($cardBody);

            $('#forecast').append($colmx1);
        }
    };

    // function getUvIndex(uvLoc) 

    function updateCityStore(city) {
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
        cityList.push(city);
        cityList.sort();

        // removes dulicate cities
        for (let i = 1; i < cityList.length; i++) {
            if (cityList[i] === cityList[i - 1]) cityList.splice(i, 1);
        }

        //stores in local storage
        localStorage.setItem('cityList', JSON.stringify(cityList));
    };

    function showHistory() {
        // function to pull city history from local memory
        if (test) console.log('getHistory');
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];

        $('#past-cities').empty();
        cityList.forEach(function (city) {
            let cityNameDiv = $('<div>');
            cityNameDiv.addClass("cityList");
            cityNameDiv.attr("value", city);
            cityNameDiv.text(city);
            $('#past-cities').append(cityNameDiv);
            getCurWeather(city);

        });
    };

    // will get location when page initializes
    // const location = getCurLocation();
});