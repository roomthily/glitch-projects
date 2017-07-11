// init project
var express = require('express');
var app = express();

var Client = require('node-rest-client').Client, 
    exphbs = require('express-handlebars'),
    bodyparser = require('body-parser'),
    random = require('random-js'),
    maths = require('mathjs'),
    user = {
      name: process.env.NAME,
      authorization: process.env.AUTHORIZATION,
      exclude_projects: process.env.EXCLUDE.split(','),
      highlighted_projects: process.env.HIGHLIGHT.split(',')
    };

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

var engine = random.engines.mt19937().autoSeed();
var bottom_distribution = random.integer(10, 95);
var left_distribution = random.integer(5, 95);

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
    // strip out any excluded projects or private projects    
    var projects = data.projects.filter(prj => {
      // not currently looking for an invite token
      //  ie. data.projects[project].inviteToken
      // but also auto-excluding any private projects
      return !(user.exclude_projects.includes(prj.domain)) && prj.private == false;
    });
    
    // restructure for the layout, highlighted and everything else
    var mapped_projects = {
      highlights: projects.filter(p => {
        return user.highlighted_projects.includes(p.name);
      }),
      projects: projects.filter(p => {
        return !user.highlighted_projects.includes(p.name);
      })
    };
    
    // add the position info for the projects
    // in the grass so that they're like little
    // svg flowers
    var coords = [[90, 5], [95, 5]];
    mapped_projects.projects = mapped_projects.projects.map(p => {
      // set bottom, left in %, bounded by the lower grass
      // and avoiding the reflection and the footer
      var bottom = bottom_distribution(engine);
      var left = left_distribution(engine);
      
      var threshold = 15;
      var hits = coords.filter(pair => {
        return maths.distance(pair, [left, bottom]) < threshold;
      });
      while (hits.length > 1) {
        left = left_distribution(engine);
        bottom = bottom_distribution(engine);
        
        hits = coords.filter(pair => {
          return maths.distance(pair, [left, bottom]) < threshold;
        });
      }

      coords.push([left, bottom]);
      p.position = `bottom:${bottom}%;left:${left}%;`;
      return p;
    });
    
    console.log(mapped_projects.highlights.length, mapped_projects.projects.length);
    
    // render the handlebars templates
    response.render('home', {
      name: user.name,
      avatar: data.user.avatarUrl,
      projects: mapped_projects,
      this_project: process.env.PROJECT_NAME
    });
  }).on('error', (err) => {
    console.log(err);
    response.send('error!');
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
