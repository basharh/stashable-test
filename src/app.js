import express from "express";
import moment from "moment";

const { query, validationResult } = require("express-validator/check");

const dates = require("../data/dataset.json");

const parsedDates = dates.map(date => moment(date).unix());

function checkDate(date) {
  return /^\d{8}$/.test(date);
}

function getTimeStamp(date) {
  return moment(moment().format(date, "YYYYMMDD")).unix();
}

function getMidnightStamp() {
  return moment(moment().format("YYYYMMDD")).unix();
}

const app = express();
app.use(express.urlencoded({ extended: false }));

const port = process.env.NODE_ENV === "development" ? 3000 : 80;

app.get(
  "/",
  [
    query("start_date", "DDMMYYYY format required")
      .optional()
      .custom(value => checkDate(value)),
    query("end_date", "DDMMYYYY format required")
      .optional()
      .custom(value => checkDate(value))
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

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
      maxDaysInt = 30;
    }

    const datesRes = parsedDates
      .filter(ts => ts >= startDateTS && ts <= endDateTS)
      .slice(0, maxDaysInt)
      .map(ts => moment.unix(ts).format("YYYYMMDD"));

    return res.send(datesRes);
  }
);

// eslint-disable-next-line
app.use((err, req, res, next) => {
  console.log("Error occured:", err);

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
