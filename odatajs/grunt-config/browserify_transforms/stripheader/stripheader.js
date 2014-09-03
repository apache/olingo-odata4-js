var through = require('through');

module.exports = function (file) {
  //if (/\.json$/.test(file)) return through();
  //console.log('strip header from ' + file);
  var data = "";


  return through(
    function (buf) { data += buf;    },
    function () {
      try {
        //console.log('\nin--------------\na'+data.substring(0,1000));
        var out = data.replace(/(\/\*(.|\n|\r)*?\*\/)/i,"");
        //console.log('\nout--------------\n'+out.substring(0,300));
        this.queue(out);
      } catch (er) {
        this.emit("error", new Error(er.toString().replace("Error: ", "") + " (" + file + ")"));
      }
      this.queue(null);
    }
  );
};

