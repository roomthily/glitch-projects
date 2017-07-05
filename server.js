// init project
var express = require('express');
var app = express();

var Client = require('node-rest-client').Client, 
    exphbs = require('express-handlebars'),
    bodyparser = require('body-parser'),
    user = {
      name: process.env.NAME,
      authorization: process.env.AUTHORIZATION,
      exclude_projects: process.env.EXCLUDE.split(',')
    };

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

// via https://glitch.com/edit/#!/stefan
app.get("/", (request, response) => {
  var url = "https://api.glitch.com/boot";
  
  var args = {
    parameters: { "authorization": user.authorization },
    headers: {
      "Authority": "api.glitch.com",
      "path": "/boot?authorization="+ user.authorization
    }
  };
  
  var client = new Client();
  
  // get the projects data from glitch
  client.get(url, args, (data, res) => {
    // strip out any excluded projects
    console.log(data);
    var projects = data.projects.filter(prj => {
      // not currently looking for an invite token
      //  ie. data.projects[project].inviteToken
      return !(user.exclude_projects.includes(prj.domain));
    });
    
    // render the handlebars templates
    response.render('home', {
      name: user.name,
      avatar: data.user.avatarUrl,
      projects: projects,
      this_project: process.env.PROJECT_NAME
    });
  }).on('error', (err) => {
    console.log(err);
    response.send('error!');
  });
  
  // response.sendFile(__dirname + '/views/index.html');
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
