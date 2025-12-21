

describe('A Dependency Script that uses a global script and', function() {
  beforeEach(function() {
    this.arse = 2;
    this.yo = new Yo();
    this.companyName = {};

    this.yo.init({
      namespace: this.companyName,
      scriptRoot: 'comps',
      globalDependencies: {
        globalScript: 'globalScript'
      }
    });
  });



  it('Should return "World"', function () {
    this.yo.add('hello', function () {
      return "World";
    });

    this.yo.add('globalScript');

    expect(this.companyName.comps.hello).toBe('World');
  });



  it('Should return "Hello World" from global Script', function () {
    this.yo.add('hello', function (dep) {
      return dep.globalScript;
    });

    this.yo.add('globalScript', function () {
      return 'Hello World';
    });

    expect(this.companyName.comps.hello).toBe('Hello World');
  });
});