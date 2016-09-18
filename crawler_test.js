const expect = require('chai').expect;
const sinon = require('sinon');

const FeedCrawler = require('./crawler').FeedCrawler;

describe('FBFake', () => {
  const candidato = 'fernandoHaddad';
  var FBFake;
  var loggerFake;

  beforeEach(() => {
    FBFake = {
      api: sinon.mock()
    };

    loggerFake = sinon.mock();
  });

  it('A resposta tem um erro', () => {
    const resposta = {
      error: 'Esse erro deve ser executado no looger'
    };

    FBFake.api.callsArgWith(3, resposta);
    loggerFake.twice();

    FeedCrawler(candidato, FBFake, loggerFake);

    FBFake.api.verify();
    loggerFake.verify();

    expect(loggerFake.args).to.be.deep.equal([
      ['Erro na chamada do facebook!'],
      [resposta.error]
    ]);
  });

  it('A resposta não tem feed', () => {
    const resposta = {};

    FBFake.api.callsArgWith(3, resposta);
    loggerFake.once();

    FeedCrawler(candidato, FBFake, loggerFake);

    FBFake.api.verify();
    loggerFake.verify();

    expect(loggerFake.args).to.be.deep.equal([
      [`O candidato ${candidato} não permite que seu feed seja lido`]
    ]);
  });

  it('A resposta contém um feed');
});
