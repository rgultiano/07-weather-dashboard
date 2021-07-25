const OW_API_KEY = '84593e18a8a2a2437ba52d1559108e60';
const selectedCity = {};

const searchHistory = [];


async function getCitySearch(request, response){
    const resp = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(request.term)}&limit=5&appid=${OW_API_KEY}`,{
        method: 'GET'
    });
    let cities = [];
    if (resp.ok)
        cities = await resp.json()

    console.log(cities);
    let return_data = [];
    cities.forEach(({name, lat, lon, country, state}) =>{
        let val = name;
        if(!state)
            val = val + ` (${country})`;
        else
            val = val + ` (${state} - ${country})`;
        
        return_data.push({name: name, lat: lat, lon: lon, value: val});
    });
    console.log(return_data)
    response(return_data);
}

async function getWeather({lat, lon, name, search_name}, save_history=true){
    if(lat && lon){
        const resp = await fetch(`https://api.openweathermap.org/data/2.5/onecall?units=metric&lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${OW_API_KEY}`,{
            method: 'GET'
        });
        if(resp.ok){
            let data = await resp.json();
            populateCurrentWeather(data.current, name);
            populateDailyWeather(data.daily);
            if(save_history){
                addHistory(lat, lon, name, search_name);
                refreshHistory();
            }
        } else {
            //handle error
        }
    }
}

function addHistory(lat, lon, name, search_name){
    searchHistory.unshift({lat: lat, lon: lon, name: name, search_name: search_name});
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function refreshHistory(){
    $('.search-history').empty();
    searchHistory.forEach(({search_name}, index)=>{
        let searchItemBtn = $('<button>');
        searchItemBtn.text(search_name);
        searchItemBtn.val(index);
        searchItemBtn.click(function(){
            console.log($(this).val());
            getWeather(searchHistory[parseInt($(this).val())], false);
        });
        $('.search-history').append(searchItemBtn);
    });
}

function populateDailyWeather(daily){
    daily.forEach((weather,index)=>{
        populateWeatherResult(weather, index);
    })
}

function populateCurrentWeather({temp, wind_speed, humidity, uvi, dt, weather}, city_name){
    $('.current-weather .city').text(city_name);
    $('.current-weather .date').text(moment.unix(dt).format("DD/MM/YYYY"));
    $('.current-weather .temp').text(temp);
    $('.current-weather .wind').text(wind_speed);
    $('.current-weather .humidity').text(humidity);
    $('.current-weather .uvi').text(uvi);
    $('.current-weather .wicon').attr("src", "https://openweathermap.org/img/w/" + weather[0].icon + ".png").show().prop('display', 'inline');


    //color uvi
    if(uvi < 2){
        $('.current-weather .uvi').addClass('low-uvi');
        $('.current-weather .uvi').removeClass(['med-uvi', 'high-uvi']);
    } else if (uvi < 7){
        $('.current-weather .uvi').addClass('med-uvi');
        $('.current-weather .uvi').removeClass(['low-uvi', 'high-uvi']);
    } else{
        $('.current-weather .uvi').addClass('high-uvi');
        $('.current-weather .uvi').removeClass(['med-uvi', 'low-uvi']);
    }
}

function populateWeatherResult({temp, wind_speed, humidity, dt, weather}, index){
    //populate the weather result for a given index
    $(`.weather-result:eq(${index}) .date`).text(moment.unix(dt).format("DD/MM/YYYY"));
    $(`.weather-result:eq(${index}) .temp`).text(temp.day);
    $(`.weather-result:eq(${index}) .wind`).text(wind_speed);
    $(`.weather-result:eq(${index}) .humidity`).text(humidity);
    $(`.weather-result:eq(${index}) .wicon`).attr("src", "https://openweathermap.org/img/w/" + weather[0].icon + ".png").show();
}

function processSelect(_, {item}){
    console.log(item);
    // load the selected city
    selectedCity.lat = item.lat;
    selectedCity.lon = item.lon;
    selectedCity.name = item.name; 
    selectedCity.search_name = item.value;   

    console.log(selectedCity);
    //enable button when a city is selected
    $('#search').prop('disabled', false);
}

function init(){
    $('#city-input').autocomplete({
        source: getCitySearch,
        select: processSelect,
        search: function (){
            // disable the search button
            // it will be renabled when an item is selcted
            $('#search').prop('disabled', true);
        }
    });
    $('#search').click(()=>getWeather(selectedCity));
    // show nothing for all values
    $('.search-results .city').text('');
    $('.search-results .date').text('-');
    $('.search-results .temp').text('-');
    $('.search-results .wind').text('-');
    $('.search-results .humidity').text('-');
    $('.search-results .uvi').text('-');
    $('.search-results .wicon').hide();

    //disable search button to begin with
    $('#search').prop('disabled', true);

    //load search history
    if(localStorage.getItem('searchHistory')){
        searchHistory.unshift(...JSON.parse(localStorage.getItem('searchHistory')));
        refreshHistory();
    }
}

//init
$(function(){
    init();
});