var through = require('through');

module.exports = function (file) {
  //if (/\.json$/.test(file)) return through();

  var data = "";

  return through(
    function (buf) { data += buf;    },
    function () {
      try {
        var out = data.replace(/^(\/\*(.|\n|\r)*?\*\/)/gi,"");
        this.queue(out);
      } catch (er) {
        this.emit("error", new Error(er.toString().replace("Error: ", "") + " (" + file + ")"));
      }
      this.queue(null);
    }
  );
};

