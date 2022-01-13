const UrlFactory = require('./UrlFactory');

function parseFitbitData(data) {
    if (!data)
        throw "Fitbit API returned an empty response";

    const status = data.statusCode;
    const body = data.body;

    if (status == 204) { // No content
        return {}
    }

    let result_json;
    try {
        result_json = JSON.parse(body);
    } catch (e) {
        throw "Json parse error: " + e.message;
    }

    if (result_json.hasOwnProperty("errors"))
        throw "Fitbit API error: " + result_json.errors.map(e=>e.message).join(", ");

    return result_json;
}

function typedDataFactory(RED, config, node) {
    return function getTypedInput(msg, key) {
        const type = key + 'Type';

        if (!config[type]) return config[key];

        switch (config[type]) {
            case 'str':
                return config[key];
            case 'date':
                return new Date();
            case 'msg':
                return RED.util.getObjectProperty(msg, config[key]);
            case 'flow':
                return node.context().flow.get(config[key]);
            case 'global':
                return node.context().global.get(config[key]);

            default:
                break;
        }
    }
}

module.exports = function (RED) {
    const oauth = require('./oauth-helper')(RED);

    const RESOURCE_TYPES = {
        "devices": {
            display: RED._("fitbit.resources.get-devices-in"),
            inputs: [],
            method: "GET",
            func: UrlFactory.getDevicesInformation
        },
        "get-activity-log-list": {
            display: RED._("fitbit.resources.get-activity-log-list"),
            inputs: ["beforeDate", "afterDate", "sort", "limit"],
            method: "GET",
            func: UrlFactory.getActivityLogList
        },
        "get-daily-activity-summary": {
            display: RED._("fitbit.resources.get-daily-activity-summary"),
            inputs: ["startDate"],
            method: "GET",
            func: UrlFactory.getDailyActivitySummary
        },
        "get-activity-timeseries": {
            display: RED._("fitbit.resources.get-activity-timeseries"),
            inputs: ["activitiesSeriesPath", "startDate", "endDate", "period"],
            method: "GET",
            func: UrlFactory.getActivityTimeSeries
        },
        "get-body-timeseries": {
            display: RED._("fitbit.resources.get-body-timeseries"),
            inputs: ["bodySeriesPath", "startDate", "endDate", "period"],
            method: "GET",
            func: UrlFactory.getBodyTimeSeries
        },
        "get-food-timeseries": {
            display: RED._("fitbit.resources.get-food-timeseries"),
            inputs: ["foodSeriesPath", "startDate", "endDate", "period"],
            method: "GET",
            func: UrlFactory.getFoodTimeSeries
        },
        "log-body-weight": {
            display: RED._("fitbit.resources.log-body-weight"),
            inputs: ["date", "weight"],
            method: "POST",
            func: UrlFactory.logBodyWeight
        },
        "log-body-fat": {
            display: RED._("fitbit.resources.log-body-fat"),
            inputs: ["date", "bodyFat"],
            method: "POST",
            func: UrlFactory.logBodyFat
        },
        "get-food-log": {
            display: RED._("fitbit.resources.get-food-log"),
            inputs: ["date"],
            method: "GET",
            func: UrlFactory.getFoodLog
        },
        "get-sleep-log-date": {
            display: RED._("fitbit.resources.get-sleep-log-date"),
            inputs: ["date"],
            method: "GET",
            func: UrlFactory.getSleepLogDate
        },
        "get-sleep-log-list": {
            display: RED._("fitbit.resources.get-sleep-log-list"),
            inputs: ["beforeDate", "afterDate", "sort", "limit"],
            method: "GET",
            func: UrlFactory.getSleepLogList
        },
        "log-activity": {
            display: RED._("fitbit.resources.log-activity"),
            inputs: ["date", "startTime", "durationSec", "activityId", "activityName", "manualCalories", "distance", "distanceUnit"],
            method: "POST",
            func: UrlFactory.logActivty,
        },
        "delete-activity": {
            display: RED._("fitbit.resources.delete-activity"),
            inputs: ["activityLogId"],
            method: "DELETE",
            func: UrlFactory.deleteActivty,
        },
        "log-food": {
            display: RED._("fitbit.resources.log-food"),
            inputs: ["startDate", "foodId", "mealTypeId", "unitId", "manualCalories"],
            method: "POST",
            func: UrlFactory.logFood,
        },
    };

    function fitbitInNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const getTypedData = typedDataFactory(RED, config, node);

        const errorReport = function (errorText, msg) {
            node.error(errorText, msg);
            node.status({text: errorText , fill: "red"});
            node.send(null);
        };

        if (!RED.nodes.getNode(config.fitbit)) {
            this.warn(RED._("fitbit.warn.missing-credentials"));
            return;
        }

        if (!config.resource) {
            this.warn(RED._("fitbit.warn.missing-resource"));
            return;
        }

        const resource = RESOURCE_TYPES[config.resource];

        node.on('input', function (msg) {
            let url;
            node.status("");
            try {
                let data = {};
                resource.inputs.forEach((input) => {
                    data[input] = getTypedData(msg, input);
                });
                msg.inputdata = data;
                url = resource.func(data);
                msg.urlsent = url;
            } catch (err) {
                errorReport(err, msg);
                return;
            }

            if (!url) {
                errorReport("Could not build api url", msg);
                return;
            }

            const credentialsNode = RED.nodes.getNode(config.fitbit);
            const credentials = RED.nodes.getNode(config.fitbit).credentials;

            oauth.makeRequest(resource.method, url, credentials, credentialsNode.id).then(data => {
                try {
                    msg.raw = data;
                    msg.payload = parseFitbitData(data);
                } catch (err) {
                    errorReport(err, msg);
                    return;
                }

                node.send(msg);
            })
        });
    }
    RED.nodes.registerType("fitbit", fitbitInNode);


    RED.httpAdmin.get('/fitbit/resources', function (req, res) {
        res.send(RESOURCE_TYPES);
    });
}
