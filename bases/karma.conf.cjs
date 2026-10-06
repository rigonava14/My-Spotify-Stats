module.exports = function (config) {
  config.set({
    frameworks: ["jasmine"],
    plugins: [require("karma-jasmine"), require("karma-chrome-launcher")],
    browsers: ["ChromeHeadless"],
    customLaunchers: {
      ChromeHeadless: {
        base: "Chrome",
        flags: [
          "--headless",
          "--disable-gpu",
          "--disable-gpu-sandbox",
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--remote-debugging-port=0",
        ],
      },
    },
    singleRun: true,
    reporters: ["progress"],
  });
};
