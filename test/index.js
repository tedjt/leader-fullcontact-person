
var assert = require('assert');
var should = require('should');
var plugin = require('..');

describe('leader-fullcontact-name', function () {
  this.timeout(10000);

  var fullcontactPerson = plugin({apiKey: 'xxx'});

  it('should validate name', function () {
    var fcData = {
      contactInfo: {
        fullName: 'Paul Gullas',
        givenName: 'Paul',
        familyName: 'Gullas'
      }
    };
    var person = {
      name: 'Paul Graham',
      firstName: 'Paul',
      lastName: 'Graham'
    };
    assert(!plugin.test.validateName(fcData, person));

    person.lastName = 'G. ';
    assert(plugin.test.validateName(fcData, person));

    fcData = {
      contactInfo: {
        fullName: 'Ted Jacob Tomlinson',
        givenName: 'Ted',
        familyName: 'Tomlinson'
      }
    };
    person = {
      name: 'Ted T.',
      firstName: 'Ted',
      lastName: 'T.  '
    };
    assert(plugin.test.validateName(fcData, person));
  });

  it('should wait if theres no email', function () {
    var context = {}, person = {};
    assert(!fullcontactPerson.wait(person, context));
  });

  it.skip('should not wait if there is a email name', function () {
    var person = { email: 'zumbino@gmail.com'};
    var context = {};
    assert(fullcontactPerson.wait(person, context));
  });

  it.skip('should be able to resolve a valid fullcontact person for zumbino@gmail.com', function (done) {
    var person = { email: 'zumbino@gmail.com' };
    var context = {};
    fullcontactPerson.fn(person, context, function (err) {
      if (err) return done(err);
      assert(person);
      person.name.should.equal('Ted Tomlinson');
      person.firstName.should.equal('Ted');
      person.lastName.should.equal('Tomlinson');
      person.linkedin.url.should.equal('https://www.linkedin.com/pub/ted-tomlinson/17/a13/404');
      done();
    });
  });


  it('should be able to resolve a valid fullcontact person for twitter', function (done) {
    var person = { twitter: {username : 'nostalgicchile' }};
    var context = {};
    fullcontactPerson.fn(person, context, function (err) {
      if (err) return done(err);
      console.log(person);
      assert(person);
      person.location.should.equal('SANTIAGO, CHILE');
      done();
    });
  });

  it('should be able to resolve a valid fullcontact person for paul Graham', function (done) {
    var person = { email: 'pg@ycombinator.com' };
    var context = {};
    fullcontactPerson.fn(person, context, function (err) {
      if (err) return done(err);
      assert(person);
      assert(context.fullcontact);
      assert(person.name);
      done();
    });
  });
});
