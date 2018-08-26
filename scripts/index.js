let locationSet = false;

//On document ready setup all necessary functionality
$(function () {
    setUserLocation();

    $('.selection-button').on('click', function () {
        chooseOption($(this));
    });

    $('#confirm-search-button').on('click', function () {
        if (locationSet) {
            queryFoursquare();
        } else {
            showLocationNotSetWarning()
        }
    });

    $('#location-input-field').on('keyup', function (event) {
        locationInputKeyupFunction(event);
    });
});

//Function to handle what happens when the user performs actions while the location input field is in focus.
function locationInputKeyupFunction(event) {
    if ($('#location-input-field').val() === '' && $('#userLocation').val() === '') {
        locationSet = false;
    } else {
        locationSet = true;
    }

    if (event.keyCode === 13) {
        $('#confirm-search-button').trigger('click');
    }
}

//Function executed when the user makes a new choice in the selection process
function chooseOption(button) {
    if (button.hasClass('choice-1')) {
        $('#chosenSection').val(button.attr('name').valueOf() + '=' + button.val());
        $('.selection-1').prop('hidden', true);
        $('.selection-2').prop('hidden', false);
        addToCurrentSelection(button.attr('id'), 'selection-row-1');

    } else if (button.hasClass('choice-2')) {
        $('#chosenPrice').val(button.attr('name').valueOf() + '=' + button.val());
        $('.selection-2').prop('hidden', true);
        $('.selection-3').prop('hidden', false)
        addToCurrentSelection(button.attr('id'), 'selection-row-2');
    }
}

//Adds the selected choice to the 'current selection' section on the page
function addToCurrentSelection(selectionName, selectionRowId) {
    $('#selected-items-row').append(
        '<div class="col-1"> <button type="button" class="btn btn-outline-secondary" data-toggle="tooltip" data-placement="bottom" title="Click to change selection" name="' + selectionRowId + '">' + selectionName + ' </button> </div>'
    );
    //Calling this function initializes the tooltip to be styled correctly
    $('[data-toggle="tooltip"]').tooltip();
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

function queryFoursquare() {
    let queryURL = buildQueryURL();
    $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        cache: false,
        url: queryURL,
        success: function (data) {
            console.log(data);
            parseResultData(data);
        }
    })
}

function buildQueryURL() {
    let clientId = 'HZWTV4JI1MKHKHQUYDZ2LEFKKPFJGBQ5S2Y4AVYXV3QKORVJ';
    let clientSecret = 'GK3Z1PCUCG5L2A2NO5NYPXTCHAPE2EAASHNUR03PLUQLKMV3';
    let foursquareVersioning = '20180825';
    let baseURL = 'https://api.foursquare.com/v2/venues/explore?';
    let result;

    if ($('#location-input-field').val() !== '') {
        result = baseURL + 'near=' + $('#location-input-field').val();
    } else {
        result = baseURL + 'll=' + $('#userLocation').val();
    }
    result = result + '&' + $('#chosenSection').val();
    result = result + '&' + $('#chosenPrice').val();
    result = result + '&limit=10&client_id=' + clientId + '&client_secret=' + clientSecret + '&v=' + foursquareVersioning;

    return result;
}

//Function to parse the returned json and add it into the DOM for the user to see. Also handles returned error codes.
function parseResultData(jsonData) {

}

function showLocationNotSetWarning() {
    $('#alert-display-col').html(
        '<div class="alert alert-warning alert-dismissible fade show" role="alert"> Location not set, please fill in a location in the textfield below. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>'
    )
}