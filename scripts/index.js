let locationSet = false;

let clientId = 'HZWTV4JI1MKHKHQUYDZ2LEFKKPFJGBQ5S2Y4AVYXV3QKORVJ';
let clientSecret = 'GK3Z1PCUCG5L2A2NO5NYPXTCHAPE2EAASHNUR03PLUQLKMV3';
let foursquareVersioning = '20180825';

//On document ready setup all necessary functionality
$(function () {
    setUserLocation();

    $('.pg-selection-button').on('click', function () {
        chooseOption($(this));
    });

    $('#confirm-search-button').on('click', function () {
        if (locationSet) {
            foursquareExploreQuery();
        } else {
            showLocationNotSetWarning()
        }
    });

    $('#location-input-field').on('keyup', function (event) {
        locationInputKeyupFunction(event);
    });

    $('#reset-search-button').on('click', function () {
        resetSearch()
    });
});

function resetSearch() {
    $('#reset-search-button').addClass('disabled');
    $('#selected-items-row').html('');
    $('.pg-selection').attr('hidden', true);
    $('.pg-selection-1').attr('hidden', false);
    $('#location-input-field').val('');
    if ($('#userLocation').val() === '') {
        locationSet = false;
    }
}


//Function to handle what happens when the user performs actions while the location input field is in focus.
function locationInputKeyupFunction(event) {
    locationSet = !($('#location-input-field').val() === '' && $('#userLocation').val() === '');

    if (event.keyCode === 13) {
        $('#confirm-search-button').trigger('click');
    }
}

//Function executed when the user makes a new choice in the selection process
function chooseOption(button) {
    if (button.hasClass('choice-1')) {
        $('#chosenSection').val(button.attr('name').valueOf() + '=' + button.val());
        $('#reset-search-button').removeClass('disabled');
        $('.pg-selection-1').prop('hidden', true);
        $('.pg-selection-2').prop('hidden', false);
        addToCurrentSelection(button.attr('id'));

    } else if (button.hasClass('choice-2')) {
        $('#chosenPrice').val(button.attr('name').valueOf() + '=' + button.val());
        $('.pg-selection-2').prop('hidden', true);
        $('.pg-selection-3').prop('hidden', false);
        addToCurrentSelection(button.attr('id'));
    }
}

//Adds the selected choice to the 'current selection' section on the page
function addToCurrentSelection(selectionName) {
    $('#selected-items-row').append(
        '<div class="col-1">' +
        '   <button type="button" class="btn btn-outline-secondary disabled">' + selectionName + '</button> ' +
        '</div>'
    );
    //Calling this function initializes the tooltip to be styled correctly
    // $('[data-toggle="tooltip"]').tooltip();
}

//Set the user location in the hidden input field, if no location can be found the error function is called
function setUserLocation() {
    locationSet = false;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setLatLongString, errorGettingLocation);
    } else {
        errorGettingLocation();
    }
}

//Sets the returned latitude/longitude in the hidden input field
function setLatLongString(position) {
    let userLLString = position.coords.latitude + ',' + position.coords.longitude;
    $('#userLocation').val(userLLString);
    locationSet = true;
    $('#location-input-field').attr('placeholder', 'Using current location, fill in an alternate location here.');
}

//Error function for when the location could not be found
function errorGettingLocation() {
    $('#location-input-field').attr('placeholder', 'Please fill in your desired location.');
}

//Queries the details of a specific venue from Foursquare
function foursquareVenueQuery(venueId) {
    let baseURL = 'https://api.foursquare.com/v2/venues/';
    let queryURL = baseURL + venueId;
    queryURL += '?client_id=' + clientId + '&client_secret=' + clientSecret + '&v=' + foursquareVersioning;

    $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        cache: false,
        url: queryURL,
        success: function (data) {
            console.log(data);
            displayVenueInformation(data);
        }
    })
}

//Queries foursquare for multiple venues
function foursquareExploreQuery() {
    let queryURL = buildExploreQueryURL();
    $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        cache: false,
        url: queryURL,
        success: function (data) {
            parseResultData(data);
        }
    })
}

//Build the URL for the explore query
function buildExploreQueryURL() {
    let baseURL = 'https://api.foursquare.com/v2/venues/explore?';
    let result;
    let resultLimit = 6;
    let locationInputValue = $('#location-input-field').val();
    if (locationInputValue !== '') {
        result = baseURL + 'near=' + locationInputValue;
    } else {
        result = baseURL + 'll=' + $('#userLocation').val() + '&radius=5000';
    }
    result = result + '&' + $('#chosenSection').val();
    result = result + '&' + $('#chosenPrice').val();
    result = result + '&limit=' + resultLimit + '&client_id=' + clientId + '&client_secret=' + clientSecret + '&v=' + foursquareVersioning;

    console.log(result);
    return result;
}

//Function to parse the returned json and add it into the DOM for the user to see. Also handles returned error codes.
function parseResultData(jsonData) {
    $('#foursquare-results-row').html('');
    let resultsHeader = $('#foursquare-results-header');
    resultsHeader.html('');
    if (jsonData.meta.code !== 200) {
        resultsHeader.html(
            '<div class="alert alert-warning alert-dismissible fade show" role="alert">'
            + jsonData.meta.errorDetail +
            '   <button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '       <span aria-hidden="true">&times;' +
            '       </span> ' +
            '   </button> ' +
            '</div>'
        )
    } else {
        resultsHeader.html(
            '<h2>Results found in ' + jsonData.response.headerFullLocation + '</h2>'
        );

        $.each(jsonData.response.groups[0].items, function (index, value) {
            foursquareVenueQuery(value.venue.id);
        })
    }
}

//Display a venue in the page using the returned results. Checks if the status code returned is correct.
function displayVenueInformation(jsonData) {
    if (jsonData.meta.code === 200) {
        $('#foursquare-results-row').append(
            '<div class="col-lg-3 col-md-4 col-sm-6 ml-1 mr-1 mb-2">' +
            '   <img class="card-img-top pg-card-image" src="' + jsonData.response.venue.bestPhoto.prefix + '600x600' +
            jsonData.response.venue.bestPhoto.suffix + '" alt="Card image cap">' +
            '    <div class="card">' +
            '        <div class="card-body bg-light">' +
            '            <h5 class="card-title">' + jsonData.response.venue.name + '</h5>' +
            '            <p class="card-text">Category: ' + jsonData.response.venue.categories[0].name + '</p><p></p>' +
            '            <a href="' + jsonData.response.venue.url + '" class="btn btn-primary" target="_blank">Go to site</a>' +
            '        </div>' +
            '    </div>' +
            '</div>'
        )
    }
}

//Shows an error indicating the user has not set a location yet
function showLocationNotSetWarning() {
    $('#location-alert-display-col').html(
        '<div class="alert alert-warning alert-dismissible fade show" role="alert"> ' +
        '   Location not set, please fill in a location in the textfield below. ' +
        '   <button type="button" class="close" data-dismiss="alert" aria-label="Close"> ' +
        '       <span aria-hidden="true">&times;' +
        '       </span> ' +
        '   </button>' +
        ' </div>'
    )
}