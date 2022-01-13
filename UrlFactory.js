const moment = require('moment');

function fitbitUrl(...uri) {
  return "https://api.fitbit.com/1/" + uri.join("/") + ".json";
}

function fitbitUrlCurrentUser(...uri) {
  return fitbitUrl("user", "-", ...uri);
}

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD');
}

function formatTime(date) {
  return moment(date).format('HH:mm:ss');
}

function checkData(data) {
  if (!data)
    throw new Error("No data specified");
}

function checkValidPeriod(data) {
  if (!['1d', '7d', '1w', '1m', '3m', '6m', '1y'].includes(data.period)) throw new Error("Invalid period. Use 1d, 7d, 1w, 1m, 3m, 6m, or 1y");
}

function checkSort(data) {
  if (!['asc', 'desc'].includes(data.sort)) throw new Error("Sort must be asc or desc.");
}

class UrlFactory {

  static getDevicesInformation() {
    return fitbitUrlCurrentUser("devices");
  }

  static getActivityLogList(data) {
    //sample URL
    // https://api.fitbit.com/1/user/-/activities/list.json?afterDate=2019-01-01&sort=asc&offset=0&limit=2
    // API Docs https://dev.fitbit.com/build/reference/web-api/activity/get-activity-log-list/
    checkData(data);
    checkSort(data);

    const urlObj = new URL(fitbitUrlCurrentUser("activities", "list"));

    if (!data.afterDate) {
      if (!data.beforeDate) {
        throw new Error("Either Before Date or After Date must be specified.");
      } else {
        urlObj.searchParams.append("beforeDate", formatDate(data.beforeDate));
      }
    } else {
      urlObj.searchParams.append("afterDate", formatDate(data.afterDate));
    }

    urlObj.searchParams.append("sort", data.sort);
    urlObj.searchParams.append("limit", data.limit);
    urlObj.searchParams.append("offset", "0");

    return urlObj.href;
  }

  static getDailyActivitySummary(data) {
    checkData(data);

    if (!data.date) {
      throw "Date is required.";
    }
    return fitbitUrlCurrentUser("activities/date/", formatDate(data.date));
  }

  static getActivityTimeSeries(data) {
    checkData(data);

    if (!data.activitiesSeriesPath) {
      throw new Error("Resource is required");
    }
    if (!data.endDate) {
      throw new Error("End date is required.");
    }
    const formattedEndDate = formatDate(data.endDate);

    // Gets either data between 2 dates or a period of time ending on the end date.
    // If period defined, just use end date.

    if (data.period) {
      if (['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'].includes(data.period)){
        return fitbitUrlCurrentUser("activities", data.activitiesSeriesPath, "date", formattedEndDate, data.period);
      } else {
        throw new Error("Period:" + data.period + "  Invalid period. Use 1d, 7d, 30d, 1w, 1m, 3m, 6m or 1y");
      }
    } else if (data.startDate) {
      return fitbitUrlCurrentUser("activities", data.activitiesSeriesPath, "date", formatDate(data.startDate), formattedEndDate);
    } else {
      throw new Error("Input must be end date and either satart date or period.");
    }
  }

  static getBodyTimeSeries(data) {
    checkData(data);

    if (!data.bodySeriesPath) {
      throw new Error("Resource of bmi, fat, or weight is required");
    } else if (!['bmi', 'fat', 'weight'].includes(data.bodySeriesPath)) {
      throw new Error("Resource of bmi, fat, or weight is required");
    } 

    if (!data.endDate) {
      throw new Error("End date is required.");
    }
    const formattedEndDate = formatDate(data.endDate);

    // Gets either data between 2 dates or a period of time ending on the end date.
    // If period defined, just use end date.

    if (data.period) {
      if (['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y', 'max'].includes(data.period)){
        return fitbitUrlCurrentUser("body", data.bodySeriesPath, "date", formattedEndDate, data.period);
      } else {
        throw new Error("Period:" + data.period + "  Invalid period. Use 1d, 7d, 30d, 1w, 1m, 3m, 6m, 1y, or max");
      }
    } else if (data.startDate) {
      return fitbitUrlCurrentUser("body", data.bodySeriesPath, "date", formatDate(data.startDate), formattedEndDate);
    } else {
      throw new Error("Input must be end date and either satart date or period.");
    }
  }

  static getFoodTimeSeries(data) {
    checkData(data);

    if (!data.foodSeriesPath) {
      throw new Error("Resource is required");
    }
    if (!data.endDate) {
      throw new Error("End date is required.");
    }
    const formattedEndDate = formatDate(data.endDate);

    // Gets either data between 2 dates or a period of time ending on the end date.
    // If period defined, just use end date.

    if (data.period) {
      return fitbitUrlCurrentUser("foods/log", data.foodSeriesPath, "date", formattedStartDate, data.period);
    } else if (data.endDate && !data.period) {
      const formattedEndDate = formatDate(data.endDate);
      return fitbitUrlCurrentUser("foods/log", data.foodSeriesPath, "date", formattedStartDate, formattedEndDate);
    } else {
      throw new Error("Bad input combination");
    }
  }

  static logBodyWeight(data) {
    checkData(data);

    const urlObj = new URL(fitbitUrlCurrentUser("body/log/weight"));

    if (isNaN(Number(data.weight))) {
      throw new Error("Input weight is not a number");
    } else {
      urlObj.searchParams.append("weight", data.weight);
    }
    urlObj.searchParams.append("date", formatDate(data.date));
    urlObj.searchParams.append("time", formatTime(data.date));

    return urlObj.href;
  }

  static logBodyFat(data) {
    checkData(data);

    const urlObj = new URL(fitbitUrlCurrentUser("body/log/fat"));

    if (isNaN(Number(data.bodyFat))) {
      throw new Error("Input Body Fat % is not a number");
    } else {
      urlObj.searchParams.append("fat", data.bodyFat);
    }
    urlObj.searchParams.append("date", formatDate(data.date));
    urlObj.searchParams.append("time", formatTime(data.date));

    return urlObj.href;

  }

  static getFoodLog(data) {
    checkData(data);

    if (!data.date) {
      throw new Error("Date is required.");
    } else {
      return fitbitUrlCurrentUser("foods/log/date/", formatDate(data.date));
    }
  }

  static getSleepLogDate(data) {
    checkData(data);

    if (!data.startDate) {
      throw new Error("Start date is required.");
    } else {
      return fitbitUrlCurrentUser("sleep/date/" + formatDate(data.date));
    }
  }

  static getSleepLogList(data) {
    checkData(data);
    checkSort(data);

    const urlObj = new URL(fitbitUrlCurrentUser("sleep", "list"));

    if (!data.afterDate) {
      if (!data.beforeDate) {
        throw new Error("Either Before Date or After Date must be specified.");
      } else {
        urlObj.searchParams.append("beforeDate", formatDate(data.beforeDate));
      }
    } else {
      urlObj.searchParams.append("afterDate", formatDate(data.afterDate));
    }

    urlObj.searchParams.append("sort", data.sort);
    urlObj.searchParams.append("limit", data.limit);
    urlObj.searchParams.append("offset", "0");

    return urlObj.href;
  }

  static logActivity(data) {
    checkData(data);

    if (data.activityId && data.activityName) {
      throw new Error("Either activityId or activityName should be specified.");
    }

    if (!data.activityId && !data.activityName) {
      throw new Error("activityId or activityName is required.");
    }

    if (!data.manualCalories) {
      throw new Error("manualCalories is required.");
    }

    if (!data.startDate) {
      throw new Error("Start date is required.");
    }

    if (!data.startTime) {
      throw new Error("Start time is required.");
    }

    if (!data.durationSec) {
      throw new Error("Duration is required.");
    }

    const urlObj = new URL(fitbitUrlCurrentUser("activities"));
    if (data.activityId) {
      urlObj.searchParams.append("activityId", data.activityId);
    } else {
      urlObj.searchParams.append("activityName", data.activityName);
    }

    urlObj.searchParams.append("startTime", data.startTime);
    urlObj.searchParams.append("manualCalories", data.manualCalories);
    urlObj.searchParams.append("durationMillis", String(parseInt(data.durationSec) * 1000));
    urlObj.searchParams.append("date", formatDate(data.startDate));
    if (data.distance) {
      urlObj.searchParams.append("distance", data.distance);
    }
    return urlObj.href;
  }

  static deleteActivity(data) {
    checkData(data);

    if (!data.activityLogId) {
      throw new Error("activityLogId is required.");
    }

    return fitbitUrlCurrentUser("activities", data.activityLogId);
  }

  static logFood(data) {
    checkData(data);

    if (!data.foodId) {
      throw new Error("Food ID is required.");
    }

    if (!data.manualCalories) {
      throw new Error("Calories is required.");
    }

    if (!data.startDate) {
      throw new Error("Start date is required.");
    }

    if (!data.mealTypeId) {
      throw new Error("Meal Type Id is required.");
    }

    if (!data.unitId) {
      throw new Error("Unit ID is required.");
    }

    const urlObj = new URL(fitbitUrlCurrentUser("foods/log"));

    urlObj.searchParams.append("foodId", data.foodId);
    urlObj.searchParams.append("amount", data.manualCalories);
    urlObj.searchParams.append("date", formatDate(data.startDate));
    urlObj.searchParams.append("mealTypeId", data.mealTypeId);
    urlObj.searchParams.append("unitId", data.unitId);

    return urlObj.href;
  }

}

module.exports = UrlFactory;
