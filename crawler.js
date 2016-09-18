const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const parameters = 'feed{message,comments{comment_count,like_count}}';
const FB = require('fb');

const candidates = [
  { name: 'Fernando Haddad', facebook_name: 'fernandoHaddad' },
  { name: 'Celso Russomanno', facebook_name: '100003613814366' }
];

const urlDB = 'mongodb://localhost:32768/test';

MongoClient.connect(urlDB, function (err, db) {
  assert.equal(null, err);
  console.log('Connected correctly to server.');
  const candidate_collection = db.collection('candidates');

  candidate_collection.insert(candidates, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Inserted %d candidates into the 'candidates' collection. The candidates inserted with '_id' are:", result.length, result);
    }
  })

  db.close();
});

FB.api('oauth/access_token', {
  client_id: '1815746298657244',
  client_secret: '310c0cd744b3a5d4ab533362a272c265',
  grant_type: 'client_credentials'
}, function (res) {
  if (!res || res.error) {
    console.log(!res ? 'error occurred' : res.error);
    return;
  }

  console.log('token', res.access_token);
  lerFeed(candidates[0].facebook_name, parameters, res.access_token);
});

function lerFeed(user, parameters, access_token) {
  FB.setAccessToken(access_token);

  FB.api(
    '/' + user,
    'GET',
    { 'fields': parameters },
    function (response) {
      if (response && response.error) {
        console.log('Erro na chamada do facebook !');
        console.log(response.error);
        return;
      }

      const feedItems = response.feed.data;

      feedItems.forEach(function (feedItem) {
        console.log('Mensagem do feed: ' + feedItem.message);

        var total_comments = 0;
        var total_likes = 0;

        const comments = feedItem.comments.data;

        comments.forEach(function (element) {
          total_comments += element.comment_count;
          total_likes += element.like_count;
        });

        console.log('Total de comentários: ', total_comments);
        console.log('Total de likes: ', total_likes);
        console.log('-------------------------------------------');
      });
    }
  );
}
