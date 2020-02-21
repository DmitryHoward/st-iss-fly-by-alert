const rp = require('request-promise');
// ISS Tracker API config
require('dotenv').config();
const issTrackerUrl = 'http://api.open-notify.org';
const R = 6371e3; // radius of the earth in meters
const tolerance = 2300e3; // tolerance of visible radius from user in meters

module.exports = {

    /**
     * Returns an Object containing correctly formatted ISS relative ground coordinates.
     * @param {Object} JSON object returned from ISS location API
     * @returns {Object} the longitude and latitude of the ISS fround in the API return object.
     */
    parseCoordinates: function(issData) {
        return {
            longitude: issData.iss_position.longitude,
            latitude: issData.iss_position.latitude
        };
    },

    /**
     * Returns a Bluebird Promise for getting the current ISS relative ground coordinates.
     * @returns {Promise} the Bluebird request-promise for this request.
     */
    getIssData: function () {
        const options = {
            url: `${issTrackerUrl}/iss-now.json`,
            json: true
        };
        return rp(options);
    },

    //
    // getAstronautCount: function () {
    //     const options = {
    //         url: `${issTrackerUrl}/astros.json`,
    //         json: true
    //     };
    //     return rp(options);
    // },

    /**
     * Returns a number representing the distance between two supplied coordinate sets.
     * @param {Object} coordinates_a - A valid pair of coordinates supplied as longitude, latitude.
     * @param {Object} coordinates_b - A valid pair of coordinates supplied as longitude, latitude.
     * @returns {Number} the straight-line distance between the two coordinate sets.
     */
    getGroundDistance: function (coordinates_a, coordinates_b) {
      const radConversion = Math.PI / 180;
      const lat_a = radConversion * coordinates_a.latitude;
      const lat_b = radConversion * coordinates_b.latitude;
      const long_delta = (coordinates_a.longitude - coordinates_b.longitude) * radConversion;
      const lat_delta = (coordinates_a.latitude - coordinates_b.latitude) * radConversion;

      // Haversine formula:
      const a = Math.sin(lat_delta / 2) * Math.sin(lat_delta / 2) +
              Math.cos(lat_a) * Math.cos(lat_b) *
              Math.sin(long_delta / 2) * Math.sin(long_delta / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;

      return d;
    },

    /**
     * Returns a Number representing the light dim value as a function of distance from the ISS.
     * @param {Object} groundCoordinates - A valid pair of coordinates supplied as longitude, latitude.
     * @param {Object} issCoordinates - A valid pair of coordinates supplied as longitude, latitude.
     * @returns {Number} the straight-line distance between the two coordinate sets.
     */
    getSwitchLevelForLocation: function (groundCoordinates, issCoordinates) {

        // need to determine acceptable range for coordinate differences
        // my coordinates: 44.947342, -93.329108

        const distance = module.exports.getGroundDistance(groundCoordinates, issCoordinates);
        console.log(`distance = ${distance}`);
        const dimPercent = 100 - (100 * (distance / tolerance));
        console.log(`dimPercent = ${dimPercent}`);
        // limit switch level to 0-100
        return Math.min(Math.max(dimPercent, 0), 100);
    },

};