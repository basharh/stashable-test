import express from "express";
import moment from "moment";

const dates = require("../data/dataset.json");

const parsedDates = dates.map(date => moment(date).unix());

function getTimeStamp(date) {
  return moment(moment().format(date, "YYYYMMDD")).unix();
}

function getMidnightStamp() {
  return moment(moment().format("YYYYMMDD")).unix();
}

// const today_ts = moment(moment().format("YYYYMMDD"));

const app = express();
app.use(express.urlencoded({ extended: false }));

const port = 3000;

// app.get("/", (req, res) => res.send("Hello World!"));

app.get("/", (req, res) => {
  const {
    start_date: startDate,
    end_date: endDate,
    max_days: maxDays
  } = req.query;

  let startDateTS;
  let endDateTS;
  let maxDaysInt;

  if (startDate !== undefined) {
    startDateTS = getTimeStamp(startDate);
  } else {
    startDateTS = getMidnightStamp();
  }

  if (endDate !== undefined) {
    endDateTS = getTimeStamp(endDate);
  } else {
    endDateTS = Number.MAX_VALUE;
  }

  if (maxDays !== undefined) {
    maxDaysInt = Number.parseInt(maxDays, 10);
  } else {
    maxDaysInt = Number.MAX_VALUE;
  }

  const datesRes = parsedDates
    .filter(ts => ts >= startDateTS && ts <= endDateTS)
    .slice(0, maxDaysInt)
    .map(ts => moment.unix(ts).format("YYYYMMDD"));

  res.send(datesRes);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
