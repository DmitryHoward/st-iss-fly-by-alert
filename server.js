require('dotenv').config();
const express = require('express');
const SmartApp = require('@smartthings/smartapp');
const fs = require('fs');
const weather = require('./lib/weather');
const issTracker = require('./lib/iss-tracker');
const server = express();
const PORT = process.env.PORT || 3005;

const smartapp = new SmartApp()
    .configureI18n()
    .enableEventLogging(2)
    .page('mainPage', (context, page, configData) => {
      page.section('refresh', section => {
        section.numberSetting('zipCode');
      });
      page.section('lights', section => {
        section.deviceSetting('colorLight')
            .capabilities(['colorControl', 'switch', 'switchLevel'])
            .permissions('rx');
      });
    })
    .updated(async ctx => {
        await ctx.api.schedules.unscheduleAll();
        // poll for ISS every 1 minute
        await ctx.api.schedules.schedule('issTrackerHandler', `* * * * ? *`);
        // poll for weather forecast every 15 minutes
        return ctx.api.schedules.schedule('weatherHandler', `0/15 * * * ? *`);
    })
    .scheduledEventHandler('issTrackerHandler', async ctx => {
        // tracker schedule logic
        const weatherData = await weather.getCurrentWeather(ctx.configStringValue('zipCode'));
        const groundCoordinates = weather.parseCoordinates(weatherData);
        const issData = await issTracker.getIssData();
        const issCoordinates = issTracker.parseCoordinates(issData);
        const switchLevel = issTracker.getSwitchLevelForLocation(groundCoordinates, issCoordinates);
        let switchCommand;

        // if dim value is < 1, turn the light off
        if (switchLevel < 1) {
            switchCommand = 'off';
        } else {
            switchCommand = 'on';
        }

        return ctx.api.devices.sendCommands(ctx.config.colorLight, [
            {
                capability: 'switch',
                command: switchCommand
            },
            {
                capability: 'switchLevel',
                command: 'setLevel',
                arguments: [switchLevel]
            }
        ]);
    })
    .scheduledEventHandler('weatherHandler', async ctx => {
        const forecast = await weather.getForecast(ctx.configStringValue('zipCode'));
        const color = weather.getColorForForecast(forecast, ctx.configNumberValue('forecastInterval'));

        return ctx.api.devices.sendCommands(ctx.config.colorLight, [
            {
                capability: 'colorControl',
                command: 'setColor',
                arguments: [color]
            }
        ]);
    });

if (fs.existsSync('./config/smartthings_rsa.pub')) {
    smartapp.publicKey('@config/smartthings_rsa.pub');
}

server.use(express.json());
server.post('/', (req, res, next) => {
  smartapp.handleHttpCallback(req, res);
});

server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));
