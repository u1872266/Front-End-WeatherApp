// key for the api
const KEY = 'a59f23a4b659dc3965fb02965a17e825';

// Unit constant is used to reference units from the api to english
const UNITS = {
    m: String.fromCharCode(176) + "C",
    f: String.fromCharCode(176) + "F",
    s: "K",
}

// This is the HTML of the weather element that is appended on the page 
const CITY_WEATHER_EL = '<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 p-3"> <div class="card text-dark bg-light"> <div class="card-header"> <h2 class="city-name"></h2> </div><div class="card-body"> <h5>Currently it is <span class="city-current-desc"></span></h5> <h5>Temperature: <span class="city-temp"></span><sup class="temp-unit"></sup></h5> <h5>Humidity: <span class="city-humid"></span>%</h5> </div><img class="card-img-bottom weather-icon"> </div></div>';

// When the page is loaded and DOM is loaded
$(document).ready(() => {
    // Check if geolocation is available from the user
    if (navigator.geolocation) {
        // If accepted then get the current position and callback to getCurrentLocationWeather
        navigator.geolocation.getCurrentPosition(getCurrentLocationWeather);
    }

    // Get already saved favourites from local storage
    let storage = localStorage.getItem('favourites');
    if (storage !== null) {
        // Convert to Object
        storage = JSON.parse(storage);

        // Interate around the array of objects
        storage.forEach((value) => {
            // Find current weather of saved location
            getCurrentWeatherByQuery(value.location, value.unit).then((response) => {
                response.json().then((data) => {
                    // Create the weather element on page
                    createCityWeatherElements(data, value.unit, false, true);
                });
            });
        })
    }

})

/**
 * Used for the current location to be viewed on page
 * @param {*} coordinates - Gets the coordinates as an object
 */
function getCurrentLocationWeather(coordinates) {
    // Save the coordinates
    let lat = coordinates.coords.latitude;
    let lng = coordinates.coords.longitude;

    // Get the current weather for the current location
    getCurrentWeatherByQuery(lat + "," + lng).then((response) => {
        response.json().then((data) => {
            // Display the weather for the current location
            createCityWeatherElements(data, null, true)
        })
    });
}

/**
 * Get the promise for the api call to current weather api
 *  
 * @param {*} query - City name or Coordinates to be searched via api
 * @param {*} unit - To retrieve the data in a particular unit of measure
 * @returns Promise
 */
function getCurrentWeatherByQuery(query = 'Huddersfield', unit = 'm') {
    return fetch("https://api.weatherstack.com/current?access_key=" + KEY + "&query=" + query + "&units=" + unit);
}

/**
 * Creates the element on page accordingly
 * 
 * @param {*} data - the data retrieved by the api
 * @param {*} unit - the unit used for the query
 * @param {*} isCurrentLocation - boolean if this is to be a current location element for page
 * @param {*} isFav - boolean if this is a favourite location
 */
function createCityWeatherElements(data, unit = 'm', isCurrentLocation = false, isFav = false) {
    // Create temporary element in DOM from the weather location element constant
    let $newCityElement = $(CITY_WEATHER_EL);

    if (isCurrentLocation === true) {
        // Style the current location differently
        $('.card', $newCityElement).removeClass('text-dark')
        $('.card', $newCityElement).removeClass('bg-light')
        $('.card', $newCityElement).addClass('bg-primary');
        $('.city-name', $newCityElement).text('Current Location ' + data.location.name + ", " + data.location.country);
    }
    else {
        // Apply data to element
        $('.city-name', $newCityElement).text(data.location.name + ", " + data.location.country);
        if (isFav === false) {
            // if its not a favourite then allow a favourite button to show
            $('.card-header', $newCityElement).append('<button class="btn btn-sm btn-success favBtn"><i class="fas fa-star"></i></button>');
            $('.favBtn', $newCityElement).attr('data-location', data.location.name + ", " + data.location.country);
            $('.favBtn', $newCityElement).attr('data-unit', unit);
        }
        else {
            // if its a favourite then allow a delete button to take out of storage
            $('.card-header', $newCityElement).append('<button class="btn btn-sm btn-danger deleteFavBtn"><i class="fas fa-star"></i></button>');
            $('.deleteFavBtn', $newCityElement).attr('data-location', data.location.name + ", " + data.location.country);
            $('.deleteFavBtn', $newCityElement).attr('data-unit', unit);
        }
    }
    // Apply data to element accordingly
    $('.city-temp', $newCityElement).text(data.current.temperature);
    $('.city-current-desc', $newCityElement).text(data.current.weather_descriptions[0]);
    $('.city-humid', $newCityElement).text(data.current.humidity);
    $('.weather-icon', $newCityElement).attr('src', data.current.weather_icons[0]);
    $('.temp-unit', $newCityElement).text(UNITS[unit]);

    // Add the new element to the page
    $('.cities').append($newCityElement)
}

// On submit of the search form
$('#searchForm').submit((event) => {
    // Prevent the browser reloading or going to another page
    event.preventDefault();
    // Get the inputs
    let searchTerm = $('#searchInput').val();
    let unit = $('#unit').val();

    // Find the location's current weather
    getCurrentWeatherByQuery(searchTerm, unit).then((response) => {
        response.json().then((data) => {
            // Display on page
            createCityWeatherElements(data, unit);
            // Reset the input on the form
            $('#searchInput').val("");
        });
    });
})

// Clears all the locations off the pages on resetBtn click
$('#resetBtn').click(() => {
    $('.cities').empty();
})


// User is able to add a location as favourite and stored in Local storage in user's browser
$(document).on('click', '.favBtn', (event) => {
    // Get the button element
    let $element = $(event.currentTarget);
    // Get what is stored in local storage
    let storage = localStorage.getItem('favourites');

    // If no favourites are added then create from scratch
    if (storage === null) {
        let arr = [];
        let favouriteItem = {};
        // Add data to object
        favouriteItem.location = $element.data('location');
        favouriteItem.unit = $element.data('unit');
        // Apply the object to an array to allow multiples
        arr.push(favouriteItem);
        // Save into the local storage
        localStorage.setItem('favourites', JSON.stringify(arr));
    }
    else {
        // If favourites are set
        // Convert string to array
        storage = JSON.parse(storage);
        // New object
        let favouriteItem = {};
        // Add data to object
        favouriteItem.location = $element.data('location');
        favouriteItem.unit = $element.data('unit');
        // Apply object to the existing array
        storage.push(favouriteItem);
        // Re-save into the local storage
        localStorage.setItem('favourites', JSON.stringify(storage));
    }

    // Reload the page
    location.reload();
});

// The location can be removed from favourites and also from Local storage
$(document).on('click', '.deleteFavBtn', (event) => {
    // Get the button element
    let $element = $(event.currentTarget);
    // New array
    let arr = [];
    // Get what is stored in local storage
    let storage = localStorage.getItem('favourites');
    // Find the location to be removed
    let deletingLocation = $element.data('location');
    // Convert string to array
    storage = JSON.parse(storage);

    // Iterate around array
    storage.forEach((value) => {
        // If the location is not the deleting location then push to new array
        if (value.location !== deletingLocation) {
            arr.push(value);
        }
        // The deleting location will be excluded from the array
    })

    // Re-save into the local storage
    localStorage.setItem('favourites', JSON.stringify(arr));

    // Reload the page
    location.reload();
});
