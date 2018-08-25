$(function () {
    setUserLocation();
});

function setUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setLatLongString, errorGettingLocation);
    } else {
        errorGettingLocation();
    }
}

function setLatLongString(position) {
    let userLLString = position.coords.latitude + "," + position.coords.longitude;
    $("#location-input-field").val(userLLString);
}

function errorGettingLocation() {
    $("#location-input-field").val("Please fill in your desired location");
}
