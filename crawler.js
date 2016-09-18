const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
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
      console.log(`Inserted ${result.length} candidates into the 'candidates' collection. The candidates inserted with '_id' are: `, result);
    }
  })

  db.close();
});

const crawl = () => {
  FB.api('oauth/access_token', {
    client_id: '1815746298657244',
    client_secret: '310c0cd744b3a5d4ab533362a272c265',
    grant_type: 'client_credentials'
  }, function (res) {
    if (!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }

    FB.setAccessToken(res.access_token);
    candidates.forEach(candidato => FeedCrawler(candidato.facebook_name))
  });
}

const FeedCrawler = (user, facebook, logger) => {
  const parameters = 'feed{message,comments{comment_count,like_count}}';
  const facebookApi = facebook || FB;
  const log = logger || console.log;

  facebookApi.api(
    '/' + user,
    'GET',
    { 'fields': parameters },
    function (response) {
      if (response && response.error) {
        log('Erro na chamada do facebook!');
        log(response.error);
        return;
      }

      if (!response.feed) {
        log(`O candidato ${user} não permite que seu feed seja lido`);
        return;
      }

      const feedItems = response.feed.data;

      feedItems.forEach(function (feedItem) {
        log('Mensagem do feed: ', feedItem.message);

        var total_comments = 0;
        var total_likes = 0;

        const comments = feedItem.comments.data;

        comments.forEach(function (element) {
          total_comments += element.comment_count;
          total_likes += element.like_count;
        });

        log('Total de comentários: ', total_comments);
        log('Total de likes: ', total_likes);
        log('-------------------------------------------');
      });
    }
  );
}

exports.FeedCrawler = FeedCrawler;
exports.crawl = crawl;
