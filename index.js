
const { uploadFile, downloadFile } = require('./firebase/firebase-helper')
const jsonServer = require('json-server');
const faker = require('faker')
const queryString = require('query-string');
const fs = require("fs");

faker.locale = 'vi'
const dbFile = 'db.json'

// Start server
const PORT = process.env.PORT || 5002;
const server = jsonServer.create();
server.listen(PORT, () => {
  console.log('JSON Server is running');
});

const serverBackup = async () => {

  if (fs.existsSync(dbFile))//nếu tồn tại db.json thì upload lên firebase để backup
    await uploadFile(dbFile, dbFile)
  await downloadFile() //tải file db.json mới nhất về

  const router = jsonServer.router(dbFile);
  const middlewares = jsonServer.defaults();

  // Set default middlewares (logger, static, cors and no-cache)
  server.use(middlewares);

  // Add custom routes before JSON Server router
  server.get('/echo', (req, res) => {
    res.jsonp(req.query);
  });

  // To handle POST, PUT and PATCH you need to use a body-parser
  // You can use the one used by JSON Server
  server.use(jsonServer.bodyParser);
  server.use((req, res, next) => {
    if (req.method === 'POST') {
      if (req.path === "/api/myorders") {
        req.body.createdAt = Date.now();
        req.body.updatedAt = Date.now();
      }
      else {
        req.body.createdAt = Date.now();
        req.body.updatedAt = Date.now();
        req.body.id = faker.random.uuid();
      }

    } else if (req.method === 'PATCH') {
      req.body.updatedAt = Date.now();
    }

    // Continue to JSON Server router
    next();
  });

  // Custom output for LIST with pagination
  router.render = (req, res) => {
    // Check GET with pagination
    // If yes, custom output
    const headers = res.getHeaders();

    const totalCountHeader = headers['x-total-count'];
    if (req.method === 'GET' && totalCountHeader) {
      const queryParams = queryString.parse(req._parsedUrl.query);

      const result = {
        data: res.locals.data,
        pagination: {
          _page: Number.parseInt(queryParams._page) || 1,
          _limit: Number.parseInt(queryParams._limit) || 10,
          _totalRows: Number.parseInt(totalCountHeader),
        },
      };


      return res.jsonp(result);
    }

    // Otherwise, keep default behavior
    res.jsonp(res.locals.data);
  };

  // Use default router
  server.use('/api', router);
}

serverBackup()
setInterval(serverBackup, 1000 * 60 * 20)
