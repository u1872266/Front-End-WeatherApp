// key for the api
const KEY = 'a59f23a4b659dc3965fb02965a17e825';

const UNITS = {
    m: String.fromCharCode(176) + "C",
    f: String.fromCharCode(176) + "F",
    s: "K",
}

const CITY_WEATHER_EL = '<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 p-3"> <div class="card text-dark bg-light"> <div class="card-header"> <h2 class="city-name"></h2> </div><div class="card-body"> <h5>Currently it is <span class="city-current-desc"></span></h5> <h5>Temperature: <span class="city-temp"></span><sup class="temp-unit"></sup></h5> <h5>Humidity: <span class="city-humid"></span>%</h5> </div><img class="card-img-bottom weather-icon"> </div></div>';

$(document).ready(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCurrentLocationWeather);
    }

    let storage = localStorage.getItem('favourites');
    if (storage !== null) {
        storage = JSON.parse(storage);
        storage.forEach((value) => {
            getCurrentWeatherByQuery(value.location, value.unit).then((response) => {
                response.json().then((data) => {
                    createCityWeatherElements(data, value.unit, false, true);
                });
            });
        })
    }

})

function getCurrentLocationWeather(coordinates) {
    let lat = coordinates.coords.latitude;
    let lng = coordinates.coords.longitude;
    getCurrentWeatherByQuery(lat + "," + lng).then((response) => {
        response.json().then((data) => {
            createCityWeatherElements(data, null, true)
        })
    });
}

function getCurrentWeatherByQuery(query = 'Huddersfield', unit = 'm') {
    return fetch("https://api.weatherstack.com/current?access_key=" + KEY + "&query=" + query + "&units=" + unit);
}

function createCityWeatherElements(data, unit = 'm', isCurrentLocation = false, isFav = false) {
    let $newCityElement = $(CITY_WEATHER_EL);
    if (isCurrentLocation === true) {
        $('.card', $newCityElement).removeClass('text-dark')
        $('.card', $newCityElement).removeClass('bg-light')
        $('.card', $newCityElement).addClass('bg-primary');
        $('.city-name', $newCityElement).text('Current Location ' + data.location.name + ", " + data.location.country);
    }
    else {
        $('.city-name', $newCityElement).text(data.location.name + ", " + data.location.country);
        if (isFav === false) {
            $('.card-header', $newCityElement).append('<button class="btn btn-sm btn-success favBtn"><i class="fas fa-star"></i></button>');
            $('.favBtn', $newCityElement).attr('data-location', data.location.name + ", " + data.location.country);
            $('.favBtn', $newCityElement).attr('data-unit', unit);
        }
        else {
            $('.card-header', $newCityElement).append('<button class="btn btn-sm btn-danger deleteFavBtn"><i class="fas fa-star"></i></button>');
            $('.deleteFavBtn', $newCityElement).attr('data-location', data.location.name + ", " + data.location.country);
            $('.deleteFavBtn', $newCityElement).attr('data-unit', unit);
        }
    }
    $('.city-temp', $newCityElement).text(data.current.temperature);
    $('.city-current-desc', $newCityElement).text(data.current.weather_descriptions[0]);
    $('.city-humid', $newCityElement).text(data.current.humidity);
    $('.weather-icon', $newCityElement).attr('src', data.current.weather_icons[0]);
    $('.temp-unit', $newCityElement).text(UNITS[unit]);
    $('.cities').append($newCityElement)
}

$('#searchForm').submit((event) => {
    event.preventDefault();
    let searchTerm = $('#searchInput').val();
    let unit = $('#unit').val();
    getCurrentWeatherByQuery(searchTerm, unit).then((response) => {
        response.json().then((data) => {
            createCityWeatherElements(data, unit);
            $('#searchInput').val("");
        });
    });
})

$('#resetBtn').click(() => {
    $('.cities').empty();
})


//User is able to add a location as favourite and stored in Local storage in user's browser
$(document).on('click', '.favBtn', (event) => {
    let $element = $(event.currentTarget);
    let storage = localStorage.getItem('favourites');
    if (storage === null) {
        let arr = [];
        let favouriteItem = {};
        favouriteItem.location = $element.data('location');
        favouriteItem.unit = $element.data('unit');
        arr.push(favouriteItem);
        localStorage.setItem('favourites', JSON.stringify(arr));
    }
    else {
        storage = JSON.parse(storage);
        let favouriteItem = {};
        favouriteItem.location = $element.data('location');
        favouriteItem.unit = $element.data('unit');
        storage.push(favouriteItem);
        localStorage.setItem('favourites', JSON.stringify(storage));
    }

    location.reload();
});

// The location can be removed from favourites and also from Local storage
$(document).on('click', '.deleteFavBtn', (event) => {
    let $element = $(event.currentTarget);
    let arr = [];
    let storage = localStorage.getItem('favourites');
    let deletingLocation = $element.data('location');
    storage = JSON.parse(storage);

    storage.forEach((value) => {
        if (value.location !== deletingLocation) {
            arr.push(value);
        }
    })

    localStorage.setItem('favourites', JSON.stringify(arr));

    location.reload();
});
