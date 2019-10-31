const express = require('express');
const request = require('request');
const parseString = require('xml2js').parseString;

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/weather', (req, res) => {
	let postal = req.query.postal_code
  request(
    { url: 'https://www.yr.no/sted/Norge/postnummer/'+postal+'/varsel.xml' },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: err.message });
      }
      parseString(body, function(err, result){
      	res.json(result);
      })

      // res.json((body));
    }
  )
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));