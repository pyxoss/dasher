var express = require('express');
var app = express();

var dblite = require('dblite');
var db = dblite("/home/slava/data.sqlite");


/*
  Yes, I know, the code here is attrocious, but it doesn't matter - it is feature complete.
  All processing should be done on the front-end
*/

/*
 * Data construction:
 * 
 * data.users {name: "vknyazev", total: 242, right: 100, wrong: 142, grade: 0.63, modules" [
 *  ....
 * ]"}
 * data.modules {name: "peau", total: 242, right: 100, wrong: 142, grade: 0.63, questions: [{
 *  name: 19, module: "peau", total: 19, right: 10, wrong: 9, grade: 0.63
 * },{
 *  name: 19, module: "peau", total: 19, right: 10, wrong: 9, grade: 0.63
 * },{
 *  name: 19, module: "peau", total: 19, right: 10, wrong: 9, grade: 0.63
 * },
 * ....
 * ]}
 */




var data = { users: [], modules: [], questions: [] };

app.get("/data.js", function (req, res, next) {
  res.send("var data = " + JSON.stringify(data) + `; data.moduleByName = function moduleByName(name){
  var x = null;
  this.modules.forEach(function (v,i){
    if (v.name == name){
      x = v;
      return;
    }
  })
  return x;
}; data.userByName = function userByName(name){
  var x = null;
  this.users.forEach(function (v,i){
    if (v.name == name){
      x = v;
      return;
    }
  })
  return x;
}; `);
})

app.get("/", function (req, res, next) {
  res.sendFile(__dirname + "/index.html")
});


function main() {
  //console.log(dictionary.user["jhetu1"])
  app.listen(3000)
}

db.query('SELECT `set`, count(qid), sum(pass) FROM quiz  where user != "vknyazev" and user != "vbellemare" group by `set`', function (err, rows) {
  var modules = [];
  rows.forEach(function (v, i, a) {
    modules.push({ name: v[0], total: v[1], right: v[2], wrong: v[1] - v[2], grade: v[2] / v[1] });
  });

  data.modules = modules;
  data.modules.forEach(function (module, index) {
    db.query('SELECT `qid`, count(qid), sum(pass) FROM quiz  where user != "vknyazev" and user != "vbellemare" and `set`=="' + module.name + '"group by `qid`', function (err, rows) {
      var mquestions = [];
      rows.forEach(function (v, i, a) {
        mquestions.push({ name: v[0], module: module.name, total: v[1], right: v[2], wrong: v[1] - v[2], grade: v[2] / v[1] });
        data.questions.push({ name: v[0], module: module.name, total: v[1], right: v[2], wrong: v[1] - v[2], grade: v[2] / v[1] });
      });
      data.modules[index].questions = mquestions;
      db.query('SELECT `user`, count(qid), sum(pass) FROM quiz  where user != "vknyazev" and user != "vbellemare" group by `user`', function (err, rows) {
        var users = [];
        rows.forEach(function (v, i, a) {
          users.push({ name: v[0], total: v[1], right: v[2], wrong: v[1] - v[2], grade: v[2] / v[1] });
        });

        data.users = users;


        /*data.modules.forEach(function (user, index) {
          db.query('SELECT `qid`, count(qid), sum(pass) FROM quiz  where user `user`=="' + user.name + '"group by `qid`', function (err, rows) {
            var uquestions = [];
            rows.forEach(function (v, i, a) {
              uquestions.push({ name: v[0], module: module.name, total: v[1], right: v[2], wrong: v[1] - v[2], grade: v[2] / v[1] });
            });
            data.users[index].questions = uquestions;*/
        if (index + 1 == modules.length) {

          data.users.forEach(function (user, uindex) {

            db.query('SELECT `set`, count(qid), sum(pass) FROM quiz  where user == "' + user.name + '" group by `set`', function (err, rows) {
              var umodules = [];
              rows.forEach(function (v, i, a) {
                umodules.push({ name: v[0], total: v[1], right: v[2], wrong: v[1] - v[2], grade: v[2] / v[1] });
              });

              data.users[uindex].modules = umodules;

              if (user.name=="jhetu1"){
                console.log(data.users[uindex].modules);
              }
              

              umodules.forEach(function (module, mindex) {
                db.query('SELECT `qid`, count(qid), sum(pass) FROM quiz   where user == "' + user.name + '" and `set`=="' + module.name + '"group by `qid`', function (err, rows) {
                  var uquestions = [];
                  rows.forEach(function (v, i, a) {
                    uquestions.push({ name: v[0], module: module.name, total: v[1], right: v[2], wrong: v[1] - v[2], grade: v[2] / v[1] });
                  });
                  data.users[uindex].modules[mindex].questions = uquestions;

                  if (mindex + 1 == umodules.length && uindex + 1 == data.users.length) {
                    main()
                  }

          });

          });
          });

          });

              }
          });


        });
    });
  });
  