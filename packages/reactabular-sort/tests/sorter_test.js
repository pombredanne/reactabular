import orderBy from 'lodash/orderBy';
import reverse from 'lodash/reverse';
import { expect } from 'chai';
import { sorter } from '../src';

describe('sort.sorter', function () {
  it('sorts ascending', function () {
    const columns = [{
      header: {},
      cell: {
        property: 'test'
      }
    }];
    const rows = [
      {
        test: 'abc'
      },
      {
        test: 'def'
      }
    ];
    const sortingColumns = {
      0: {
        direction: 'asc',
        position: 0
      }
    };

    const result = sorter({ columns, sortingColumns, sort: orderBy })(rows);

    expect(result).to.deep.equal(rows);
  });

  it('sorts descending', function () {
    const columns = [{
      header: {},
      cell: {
        property: 'test'
      }
    }];
    const rows = [
      {
        test: 'abc'
      },
      {
        test: 'def'
      }
    ];
    const sortingColumns = {
      0: {
        direction: 'desc',
        position: 0
      }
    };

    const result = sorter({ columns, sortingColumns, sort: orderBy })(rows);

    expect(result).to.deep.equal(reverse(rows));
  });

  it('sorts ascending and descending', function () {
    const columns = [{
      header: {},
      cell: {
        property: 'name'
      }
    }, {
      header: {},
      cell: {
        property: 'position'
      }
    }];
    const rows = [
      {
        name: 'joe',
        position: 'boss'
      },
      {
        name: 'adam',
        position: 'boss'
      },
      {
        name: 'mike',
        position: 'employee'
      }
    ];
    const expected = [
      {
        name: 'joe',
        position: 'boss'
      },
      {
        name: 'adam',
        position: 'boss'
      },
      {
        name: 'mike',
        position: 'employee'
      }
    ];
    const sortingColumns = {
      0: {
        direction: 'desc',
        position: 1
      },
      1: {
        direction: 'asc',
        position: 0
      }
    };

    const result = sorter({ columns, sortingColumns, sort: orderBy })(rows);

    expect(result).to.deep.equal(expected);
  });

  it('returns rows if there is no sorting information', function () {
    const columns = [{
      header: {},
      cell: {
        property: 'test'
      }
    }];
    const rows = [
      {
        test: 'abc'
      },
      {
        test: 'def'
      }
    ];
    const result = sorter({ columns, sort: orderBy })(rows);

    expect(result).to.deep.equal(rows);
  });

  it('returns rows if only rows is passed', function () {
    const columns = [{
      header: {},
      cell: {
        property: 'test'
      }
    }];
    const rows = [
      {
        test: 'abc'
      },
      {
        test: 'def'
      }
    ];
    const result = sorter({ columns })(rows);

    expect(result).to.deep.equal(rows);
  });

  it('sorts case-insensitively', function () {
    const columns = [{
      header: {},
      cell: {
        property: 'test'
      }
    }];
    const rows = [
      {
        test: 'crep'
      },
      {
        test: 'Bllop'
      },
      {
        test: 'Dart'
      }
    ];
    const expected = [
      {
        test: 'Bllop'
      },
      {
        test: 'crep'
      },
      {
        test: 'Dart'
      }
    ];
    const sortingColumns = {
      0: {
        direction: 'asc',
        position: 0
      }
    };
    const result = sorter({ columns, sortingColumns, sort: orderBy })(rows);

    expect(result).to.deep.equal(expected);
  });

  it('sorts numbers', function () {
    const columns = [{
      header: {},
      cell: {
        property: 'test'
      }
    }];
    const rows = [
      {
        test: 1
      },
      {
        test: 2
      },
      {
        test: 3
      }
    ];
    const sortingColumns = {
      0: {
        direction: 'asc',
        position: 0
      }
    };
    const result = sorter({ columns, sortingColumns, sort: orderBy })(rows);

    expect(result).to.deep.equal(rows);
  });

  it('does not fail if property is missing', function () {
    const columns = [{
      header: {},
      cell: {
        property: 'test'
      }
    }];
    const rows = [
      {
        test: 1
      },
      {
        test: 2
      },
      {
        test: 3
      }
    ];
    const sortingColumns = {
      0: {
        direction: 'asc',
        position: 0
      }
    };
    const result = sorter({ columns, sortingColumns, sort: orderBy })(rows);

    expect(result).to.deep.equal(rows);
  });

  it('resolves fields', function () {
    const countries = {
      de: 'Germany',
      fi: 'Finland'
    };
    const rows = [
      {
        id: 0,
        country: 'de',
        _country: countries.de
      },
      {
        id: 1,
        country: 'fi',
        _country: countries.fi
      }
    ];
    const expected = [
      {
        id: 1,
        country: 'fi',
        _country: countries.fi
      },
      {
        id: 0,
        country: 'de',
        _country: countries.de
      }
    ];
    const columns = [
      {
        cell: {
          property: 'country'
        }
      }
    ];
    const sortingColumns = {
      0: {
        direction: 'asc',
        position: 0
      }
    };
    const result = sorter({ columns, sortingColumns, sort: orderBy })(rows);

    expect(result).to.deep.equal(expected);
  });

  it('throws an error if columns are not passed', function () {
    expect(sorter()).to.throw(Error);
  });
});
