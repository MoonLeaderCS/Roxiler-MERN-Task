const router = require("express").Router();
const axios = require("axios");
const Transaction = require("../models/transactionModel");
const dataURL = process.env.DATA_URL || "";

// get api to get transaction data by month
router.get("/transactions", async (req, res) => {
  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = !isNaN(parseInt(req.query.limit))
      ? parseInt(req.query.limit)
      : 10;
    const skip = page * limit;
    const search = req.query.search || "";
    const month = !isNaN(parseInt(req.query.month))
      ? parseInt(req.query.month)
      : 3;

    const searchConfig = {
      $and: [
        month == 0
          ? {}
          : {
              $expr: {
                $eq: [{ $month: "$dateOfSale" }, month],
              },
            },
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { price: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    const data = await Transaction.find(searchConfig).skip(skip).limit(limit);
    const totalCount = await Transaction.countDocuments(searchConfig);

    const responseData = {
      success: true,
      totalCount,
      page: page + 1,
      limit,
      month,
      transactions: data,
    };
    res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// get api for statistics by month
router.get("/statistics", async (req, res) => {
  try {
    const month = !isNaN(parseInt(req.query.month))
      ? parseInt(req.query.month)
      : 3;
    const monthQuery =
      month == 0
        ? {}
        : {
            $expr: {
              $eq: [{ $month: "$dateOfSale" }, month],
            },
          };
    // project query to filter out the relevant field, reducing payload data
    const projectQuery = {
      _id: 0,
      price: 1,
      sold: 1,
      dateOfSale: 1,
    };

    const data = await Transaction.find(monthQuery, projectQuery);
    // calculation for total sale, total number of products sold and unsold
    const response = data.reduce(
      (acc, curr) => {
        const currPrice = parseFloat(curr.price);

        acc.totalSale += curr.sold ? currPrice : 0;
        acc.soldCount += curr.sold ? 1 : 0;
        acc.unsoldCount += curr.sold ? 0 : 1;

        return acc;
      },
      { totalCount: data.length, totalSale: 0, soldCount: 0, unsoldCount: 0 }
    );
    response.totalSale = response.totalSale.toFixed(2);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// get api to create an API for bar chart
router.get("/bar-chart", async (req, res) => {
  try {
    const month = !isNaN(parseInt(req.query.month))
      ? parseInt(req.query.month)
      : 3;
    const monthQuery =
      month == 0
        ? {}
        : {
            $expr: {
              $eq: [{ $month: "$dateOfSale" }, month],
            },
          };
    const projectQuery = {
      _id: 0,
      price: 1,
    };
    const data = await Transaction.find(monthQuery, projectQuery);

    let accumulator = {};

    for (let i = 1; i <= 10; i++) {
      let range = i * 100;

      if (i == 10) range = "901-above";
      else if (i == 1) range = "0-100";
      else range = `${range - 100 + 1}-${range}`;

      accumulator[range] = 0;
    }

    const response = data.reduce((acc, curr) => {
      const currPrice = parseFloat(curr.price);

      // calculation for price range such that all values <= priceRange && > priceRange-100 will fall in this range
      let priceRange = Math.ceil(currPrice / 100) * 100;

      if (priceRange == 100) priceRange = "0-100";
      else if (priceRange > 900) priceRange = "901-above";
      else priceRange = `${priceRange - 100 + 1}-${priceRange}`;

      // if current range does not exit then set to 1, else add 1
      acc[priceRange]++;

      return acc;
    }, accumulator);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// get api for pie chart, find unique categories and number of items from that category for the selected month regardless of the year
router.get("/pie-chart", async (req, res) => {
  try {
    const month = !isNaN(parseInt(req.query.month))
      ? parseInt(req.query.month)
      : 3;
    const monthQuery =
      month == 0
        ? {}
        : {
            $expr: {
              $eq: [{ $month: "$dateOfSale" }, month],
            },
          };
    const projectQuery = {
      _id: 0,
      category: 1,
    };
    const data = await Transaction.find(monthQuery, projectQuery);

    const response = data.reduce((acc, curr) => {
      // if current category does not exit then set to 1, else add 1
      acc[curr.category] ? acc[curr.category]++ : (acc[curr.category] = 1);

      return acc;
    }, {});

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// get api to fetche the data from all the 3 APIs mentioned above, combines the response and sends a final response of the combined JSON
router.get("/combined-data", async (req, res) => {
  try {
    const baseURL = req.protocol + "://" + req.get("host");
    const [stats, barChart, pieChart] = await Promise.all([
      axios.get(`${baseURL}/statistics?month=${req.query.month}`),
      axios.get(`${baseURL}/bar-chart?month=${req.query.month}`),
      axios.get(`${baseURL}/pie-chart?month=${req.query.month}`),
    ]);

    const response = {
      statsData: stats.data,
      barChartData: barChart.data,
      pieChartData: pieChart.data,
    };
    // console.log(response);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// const initDb = async () => {
//     try {
//         const {data} = await axios.get(dataURL);
//         const docs = await Transaction.insertMany(data);
//         if(docs) console.log("Database Initialised Successfully");
//     } catch (error) {
//         console.log(error);
//     }
// }
// initDb();

module.exports = router;
