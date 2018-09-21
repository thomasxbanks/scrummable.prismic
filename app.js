const Prismic = require('prismic-javascript');
const PrismicDOM = require('prismic-dom');
const request = require('request');
const Cookies = require('cookies');
const PrismicConfig = require('./prismic-configuration');
const Onboarding = require('./onboarding');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');

const app = require('./config');

app.use(expressLayouts);
app.use(bodyParser.urlencoded({
  extended: true,
}));
const PORT = app.get('port');

app.listen(PORT, () => {
  process.stdout.write(`Point your browser to: http://localhost:${PORT}\n`);
});

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: PrismicConfig.apiEndpoint,
    linkResolver: PrismicConfig.linkResolver,
  };
  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM;
  Prismic.api(PrismicConfig.apiEndpoint, {
    accessToken: PrismicConfig.accessToken,
    req,
  }).then((api) => {
    req.prismic = {
      api,
    };
    next();
  }).catch((error) => {
    next(error.message);
  });
});

/*
 *  --[ INSERT YOUR ROUTES HERE ]--
 */
// add a new route in ./app.js
const date = new Date();
app.locals = {
  views: `${__dirname}/views`,
  site: {
    name: '🎂 Scrummable',
    description: 'Like showing the good jam to the man choking on the dry bread',
    author: '@thomasxbanks',
    contact: 'hi@scrummable.com',
    colophon: 2014,
  },
  page: {
    description: 'Like showing the good jam to the man choking on the dry bread',
  },
  thisYear: date.getFullYear(),
};
app.get('/page/:uid', (req, res, next) => {
  // We store the param uid in a variable
  const uid = req.params.uid;

  // We are using the function to get a document by its uid field
  req.prismic.api.getByUID('page', uid).then((document) => {
    // document is a document object, or null if there is no match
    console.log('doc.data', document.data);
    const data = document.data;
    app.locals.page.description = data.post_title[0].text;
    app.locals.page.classes = ['page'];
    if (data) {
      // Render the 'page' pug template file (page.pug)
      res.render('page', {
        data,
      });
    } else {
      res.status(404).send('404 not found');
    }
  }).catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
});

app.get('/post/:uid', (req, res, next) => {
  // We store the param uid in a variable
  const uid = req.params.uid;

  // We are using the function to get a document by its uid field
  req.prismic.api.getByUID('post', uid).then((document) => {
    // document is a document object, or null if there is no match
    if (document) {
      const data = document.data;
      app.locals.page.description = data.post_title[0].text;
      app.locals.page.classes = ['post'];

      res.render('templates/post', {
        data,
      });
    } else {
      res.status(404).send('404 not found');
    }
  }).catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
});
/*
 * Route with documentation to build your project with prismic
 */
app.get('/', (req, res) => {
  console.log('/ req', req);
  // To retrieve the API object check how to query the API
  req.prismic.api.query(Prismic.Predicates.at('document.type', 'post'), {
    orderings: '[my.post.date desc]',
  }).then((response) => {
    // response is the response object, response.results holds the documents
    console.log('response *********************************', response.results);
    const data = response.results;
    app.locals.page.classes = ['post'];
    res.render('templates/posts', {
      data,
    });
  });
});

/*
 * Preconfigured prismic preview
 */
app.get('/preview', (req, res) => {
  const {
    token,
  } = req.query;
  if (token) {
    req.prismic.api.previewSession(token, PrismicConfig.linkResolver, '/').then((url) => {
      const cookies = new Cookies(req, res);
      cookies.set(Prismic.previewCookie, token, {
        maxAge: 30 * 60 * 1000,
        path: '/',
        httpOnly: false,
      });
      res.redirect(302, url);
    }).catch((err) => {
      res.status(500).send(`Error 500 in preview: ${err.message}`);
    });
  } else {
    res.send(400, 'Missing token from querystring');
  }
});
