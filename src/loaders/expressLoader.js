const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const apiRoutes = require("../routes/index");

const { AppConfig, AutoCodeConfig } = require("../config/index");
const { errorConverter, errorHandler } = require("../middlewares/error");

module.exports = (autocodeRoutes) => {
  const app = express();

  // set log request
  app.use(morgan("dev"));

  const cspConfig = {
    directives: {
      defaultSrc: ["'self'", "*"], // Allow everything for default sources
      scriptSrc: ["'self'",  "'unsafe-inline'", "'unsafe-eval'", "*"], // Allow scripts from self, and all
      styleSrc: ["'self'", "'unsafe-inline'", "*"], // Allow styles from self and all
      imgSrc: ["'self'", "*", "data:"], // Allow images from all sources and inline data URIs
      connectSrc: ["'self'", "*"], // Allow connections to all domains
      fontSrc: ["'self'", "*"], // Allow fonts from all sources
      objectSrc: ["'none'"], // Disable objects (Flash, etc.), as this is rarely needed
      upgradeInsecureRequests: [], // Automatically upgrade HTTP to HTTPS
    },
  
  };


app.use(cors());
app.options("*", cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: cspConfig,

}));

  // parse json request body
  app.use(express.json());

  // parse urlencoded request body
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", apiRoutes);

  // api routes
  app.use(AutoCodeConfig.AUTOCODE_API_PREFIX, autocodeRoutes);

  // convert error to ApiError, if needed
  app.use(errorConverter);

  // handle error
  app.use(errorHandler);


  return { app, port: AppConfig.PORT };
};
