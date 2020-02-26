import test from 'ava';
import weather from './weather';
import issTracker from './iss-tracker';

test('test ground coordinate fetch', async t => {
    const weatherData = await weather.getCurrentWeather('55416');
    const groundCoordinates = weather.parseCoordinates(weatherData);
    const longitude = groundCoordinates.longitude;
    const latitude = groundCoordinates.latitude;

    t.deepEqual(groundCoordinates, {longitude: -93.34, latitude: 44.95});
    t.is(longitude, -93.34);
    t.is(latitude, 44.95);
});

test('test ISS coordinate fetch', async t => {
    const issData = await issTracker.getIssData();

    t.not(issData, undefined, "ISS data is undefined.");
});

test('test distance', t => {
   const groundCoordinates = { longitude: -93.34, latitude: 44.95 };
   const issCoordinates = { longitude: 74.63, latitude: -23.55};
   const groundDistance = issTracker.getGroundDistance(groundCoordinates, issCoordinates);

   t.is(groundDistance, 17397977.190223143);
});


test('test switch on', t => {
    const groundCoordinates = { longitude: -93.34, latitude: 44.95 };
    const issCoordinates = { longitude: -96.61, latitude: 41.62 };
    const switchLevel = issTracker.getSwitchLevelForLocation(groundCoordinates, issCoordinates);
    let switchCommand;
    if (switchLevel < 1) {
        switchCommand = 'off';
    } else {
        switchCommand = 'on';
    }

    t.is(switchLevel, 80);
    t.is(switchCommand, 'on');
});

test('test switch off', t => {
    const groundCoordinates = { longitude: -93.34, latitude: 44.95 };
    const issCoordinates = { longitude: 131.75, latitude: 41.34 };
    const distance = issTracker.getGroundDistance(groundCoordinates, issCoordinates);
    const switchLevel = issTracker.getSwitchLevelForLocation(groundCoordinates, issCoordinates);
    let switchCommand;
    if (switchLevel < 1) {
        switchCommand = 'off';
    } else {
        switchCommand = 'on';
    }

    t.is(distance, 9423676.436173093);
    t.is(switchLevel, 0);
    t.is(switchCommand, 'off');
});


