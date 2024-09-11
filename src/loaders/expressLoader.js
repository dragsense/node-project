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
      defaultSrc: ["'self'", "https:"], // Allow HTTPS sources
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"], // Allow scripts from HTTPS sources
      styleSrc: ["'self'", "'unsafe-inline'", "https:"], // Allow styles from HTTPS sources
      imgSrc: ["'self'", "https:", "data:"], // Allow images from HTTPS sources and inline data URIs
      connectSrc: ["'self'", "https:"], // Allow connections to HTTPS domains
      fontSrc: ["'self'", "https:"], // Allow fonts from HTTPS sources
      objectSrc: ["'none'"], // Disable objects (Flash, etc.), as this is rarely needed
      upgradeInsecureRequests: [], // Automatically upgrade HTTP to HTTPS
    },
  };

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: cspConfig,
    })
  );

  // parse json request body
  app.use(express.json());

  // parse urlencoded request body
  app.use(express.urlencoded({ extended: true }));

  // Configure CORS
  const corsOptions = {
    origin: ["https://app.dragsense.com", "https://.dragsense.com"], // Allow multiple origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "x-api-key",
      "ngrok-skip-browser-warning",
    ],
    credentials: true, // Allow cookies to be sent with the requests if needed
  };

  // Apply CORS middleware once with proper options
  app.use(cors(corsOptions));

  // Enable pre-flight requests for all routes
  app.options("*", cors(corsOptions));

  app.use('/static', express.static('static', {
    setHeaders: function (res, path) {
      res.set('Access-Control-Allow-Origin', '*'); // Allow all origins or specific ones
    }
  }));
  // API routes
  app.use("/api", apiRoutes);
  app.use(AutoCodeConfig.AUTOCODE_API_PREFIX, autocodeRoutes);

  // Convert error to ApiError, if needed
  app.use(errorConverter);

  // Handle error
  app.use(errorHandler);

  app.listen(AppConfig.PORT);

  return { app, port: AppConfig.PORT };
};
