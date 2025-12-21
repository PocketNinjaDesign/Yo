
describe('A Basic Script that', function() {

  beforeEach(function () {
    this.yo = new Yo();
    this.company = {};
    this.yo.init({
      namespace: this.company
    });
  });

  it('Should return "World"', function() {
    this.yo.add('hello', function() {
      return "World";
    });

    expect(this.company.modules.hello).toBe('World');
  });
});



describe('A Basic Script changing scriptRoot to comps', function() {
  beforeEach(function() {
    this.yo = new Yo();
    this.company = {};
    this.yo.init({
      namespace: this.company,
      scriptRoot: 'comps'
    });
  });


  it('Should return "World"', function() {
    this.yo.add('hello', function() {
      return "World";
    });

    expect(this.company.comps.hello).toBe('World');
  });
});
