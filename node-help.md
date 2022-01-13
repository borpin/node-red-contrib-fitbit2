This node makes requests to the Fitbit API https://dev.fitbit.com/build/reference/web-api/. It will both Get data from the API and Log data to Fitbit. It is not a complete set of resources to access the API.

Please refer to the API documentation for specific input details, dates should be convertable by https://momentjs.com/docs/ MomentJS.

Some parameters, such as Period, have a limited set of inputs that vary between endpoints.

### API Resources Exposed

1. Get Devices Information
: Input requires () : none

2. Get Activity Log List
: beforeDate (timestamp, str) : The date before which the data is required (YYY-MM-DD if string)
: afterDate (timestamp, str) : The date before which the data is required

3. Get Daily Activity Summary:

4. Get Activity Timeseries   :
: Get Body Timeseries       :
: Get Food Timeseries       :
: Get Food Log              :
: Get Sleep Log by date     :
: Get Sleep Log List        :
: Log Body Weight           :
: Log Body Fat              :
: Log activity              :
: Log food                  :
: Delete activity           :
: Delete log food           :

### Input

: payload (string | buffer) :  the payload of the message to publish.
: *topic* (string)          :  the MQTT topic to publish to.

### Outputs

1. Standard output
: payload (string) : the standard output of the command.

2. Standard error
: payload (string) : the standard error of the command.

### Details

`msg.payload` is used as the payload of the published message.
If it contains an Object it will be converted to a JSON string before being sent.
If it contains a binary Buffer the message will be published as-is.

The topic used can be configured in the node or/t: if left blank, can be set
`msg.topic`.

Likewise the QoS and retain values can be configured in the node or, if left
blank, set by `msg.qos` and `msg.retain` respectively.

### References

    - [Twitter API docs]() - full description of `msg.tweet` property
    - [GitHub]() - the nodes github repository