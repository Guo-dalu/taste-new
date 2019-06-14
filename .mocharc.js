module.exports = {
  require: ["@babel/register"],
  diff: true,
  reporter: "spec",
  recursive: true,
  "check-leaks": true,
  exit: true,
  timeout: 6000,
  spect: 'test/**/*.js',
}
