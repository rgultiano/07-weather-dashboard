const OW_API_KEY = '84593e18a8a2a2437ba52d1559108e60';
const selectedCity = {};


async function getCitySearch(request, response){
    const resp = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(request.term)}&limit=5&appid=${OW_API_KEY}`,{
        method: 'GET',
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

async function getWeather({lat, lon, name}){
    if(lat && lon){
        const resp = await fetch(`https://api.openweathermap.org/data/2.5/onecall?units=metric&lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${OW_API_KEY}`,{
            method: 'GET',
        });
        if(resp.ok){
            let data = await resp.json();
            populateCurrentWeather(data.current, name);
      //      populateDailyWeather(data.daily);
        } else {
            //handle error
        }
    }
}

async function populateCurrentWeather({temp, wind_speed, humidity, uvi, dt}, city_name){
    $('.current-weather .city').text(city_name);
    $('.current-weather .date').text(moment.unix(dt).format("DD/MM/YYYY"));
    $('.current-weather .temp').text(temp);
    $('.current-weather .wind').text(wind_speed);
    $('.current-weather .humidity').text(humidity);
    $('.current-weather .uvi').text(uvi);

    //color uvi
    if(uvi < 2){
        $('.current-weather .uvi').addClass('.low-uvi');
        $('.current-weather .uvi').removeClass(['.med-uvi', '.high-uvi']);
    } else if (uvi < 7){
        $('.current-weather .uvi').addClass('.med-uvi');
        $('.current-weather .uvi').removeClass(['.low-uvi', '.high-uvi']);
    } else{
        $('.current-weather .uvi').addClass('.high-uvi');
        $('.current-weather .uvi').removeClass(['.med-uvi', '.low-uvi']);
    }
}

function processSelect(_, {item}){
    console.log(item);
    // load the selected city
    selectedCity.lat = item.lat;
    selectedCity.lon = item.lon;
    selectedCity.name = item.name;    

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
}

//init
$(function(){
    init();
});