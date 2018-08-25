let locationSet;

//On document ready setup all necessary functionality
$(function () {
    setUserLocation();

    $('.selection-button').on('click', function () {
        makeSelection($(this));
    });
});

//Function executed when the user makes a new choice in the selection process
function makeSelection(button) {
    if (button.hasClass('choice-1')) {
        $('#chosenSection').val(button.attr('name') + '=' + button.val());
        $('#selection-row-1').prop('hidden', true);
        $('#selection-row-2').prop('hidden', false);
        addToCurrentSelection(button.attr('id'), 'selection-row-1');

    } else if (button.hasClass('choice-2')) {
        $('#chosenPrice').val(button.attr('name') + '=' + button.val());
        $('#selection-row-2').prop('hidden', true);
        addToCurrentSelection(button.attr('id'), 'selection-row-2');
        queryFoursquare();
    }
}

//Adds the selected choice to the 'current selection' section on the page
function addToCurrentSelection(selectionName, selectionRowId) {
    $('#selected-items-row').append(
        '<div class="col-2"> <button type="button" class="btn btn-outline-secondary" data-toggle="tooltip" data-placement="bottom" title="Click to change selection" name="' + selectionRowId + '">' + selectionName + ' </button> </div>'
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
    $('#location-input-field').attr('placeholder', 'Using current location, fill in your desired location here.');
}

//Error function for when the location could not be found
function errorGettingLocation() {
    $('#location-input-field').attr('placeholder', 'Please fill in your desired location.');
}

function queryFoursquare() {
    $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        cache: false,
        url: 'https://api.foursquare.com/v2/venues/explore?ll=' + $('#userLocation').val() + '&limit=10&client_id=HZWTV4JI1MKHKHQUYDZ2LEFKKPFJGBQ5S2Y4AVYXV3QKORVJ&client_secret=GK3Z1PCUCG5L2A2NO5NYPXTCHAPE2EAASHNUR03PLUQLKMV3&v=20180825',
        success: function (data) {
              console.log(data);
        }
    })
}
