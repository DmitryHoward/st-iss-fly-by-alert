
# ISS Fly-By Alert SmartApp

Based off the SmartThings SmartApp tutorial found [here](https://github.com/SmartThingsCommunity/weather-color-light-smartapp-nodejs).

This WebHook SmartApp utilizes the [Open Weather Map API](https://api.openweathermap.org) as well as the [Open Notify ISS Tracker API](http://open-notify.org/Open-Notify-API/ISS-Location-Now/)
to trigger events for a multi-color LED smart bulb. The user enters a zip code during configuration that is used to grab approximate coordinates. 
Using Open Notify's API, the app polls for the current location of the ISS and calculates the approximate ground-level distance between the coordinates
using the [Haversine formula](https://www.movable-type.co.uk/scripts/latlong.html). A predefined, constant tolerance is used to calculate the brightness
of the bulb as a function of the distance between the two coordinate sets while the color of the bulb is determined by the weather forecast.
This gives the bulb the ability to inform the user of potential opportunities to witness an ISS fly-by in real time. The app was deployed using Heroku
and developed with Node.js.