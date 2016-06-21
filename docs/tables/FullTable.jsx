/* eslint-disable no-console, no-alert, no-shadow */
import React from 'react';

import findIndex from 'lodash/findIndex';
import orderBy from 'lodash/orderBy';

import {
  Table, Search, editors, sort, behaviors, formatters,
} from '../../src';

import {
  CustomFooter, ColumnFilters, EditCell, Modal, Paginator, PrimaryControls,
} from '../components';
import countries from '../data/countries';
import {
  generateData, paginate, augmentWithTitles, getFieldGenerators, find,
} from '../common';

const countryValues = countries.map((c) => c.value);
const properties = augmentWithTitles({
  name: {
    type: 'string',
  },
  position: {
    type: 'string',
  },
  salary: {
    type: 'number',
  },
  boss: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
    },
  },
  country: {
    type: 'string',
    enum: countryValues,
    enumNames: countries.map((c) => c.name),
  },
  active: {
    type: 'boolean',
  },
});
const data = generateData({
  amount: 100,
  fieldGenerators: getFieldGenerators(countryValues),
  properties,
});
const sorter = sort.byColumns; // sort.byColumn would work too

class FullTable extends React.Component {
  constructor(props) {
    super(props);

    const highlight = column => formatters.highlight(value => {
      const { search } = this.state;

      return Search.matches(
        column,
        value,
        search[Object.keys(search).pop()]
      );
    });
    const editable = behaviors.edit.bind(
      null,
      {
        getEditProperty: () => this.state.editedCell,
        onActivate: idx => this.setState({ editedCell: idx }),
        onValue: (value, { id }, property) => {
          const idx = findIndex(this.state.data, { id });

          this.state.data[idx][property] = value;

          this.setState({ editedCell: null, data });
        },
      }
    );
    const sortable = behaviors.sort.bind(
      null,
      {
        getSortingColumns: () => this.state.sortingColumns || [],
        onSort: column => {
          this.setState({
            sortingColumns: sorter(
              this.state.sortingColumns, column
            ),
          });
        },
      }
    );

    this.state = {
      editedCell: null,
      data,
      search: {},
      sortingColumns: null, // reference to the sorting columns
      columns: [
        {
          header: {
            value: 'Name',
            transform: name => sortable('name')(
              <div>
                <input
                  type="checkbox"
                  onClick={() => console.log('clicked')}
                  style={{ width: '20px' }}
                />
                <span>{name}</span>
              </div>
            ),
          },
          cell: {
            property: 'name',
            transform: (name, rest) => editable(
              editors.input()
            )(
              highlight('name')(name), rest
            ),
          },
        },
        {
          header: {
            value: 'Position',
            transform: sortable('position'),
          },
          cell: {
            property: 'position',
          },
        },
        {
          header: {
            value: 'Boss',
            transform: sortable('boss.name'),
          },
          cell: {
            property: 'boss.name',
            transform: highlight('boss.name'),
          },
        },
        {
          header: {
            value: 'Country',
            transform: sortable('country'),
          },
          cell: {
            property: 'country',
            transform: (country, rest) => editable(
              editors.dropdown({ options: countries })
            )(
              highlight('country')(country), rest
            ),
            format: country => find(countries, 'value', country).name,
          },
        },
        {
          header: {
            value: 'Salary',
            transform: sortable('salary'),
          },
          cell: {
            property: 'salary',
            transform: salary => (
              <span onDoubleClick={() => alert(`salary is ${salary}`)}>
                {highlight('salary')(salary)}
              </span>
            ),
          },
        },
        {
          header: {
            value: 'Active',
            transform: sortable('active'),
          },
          cell: {
            property: 'active',
            transform: editable(editors.boolean()),
            format: active => active && <span>&#10003;</span>,
          },
        },
        /*{
          cell: {
            format: rowEditor
          },
        },*/
      ],
      modal: {
        show: false,
        title: 'title',
        content: 'content',
      },
      pagination: {
        page: 1,
        perPage: 10,
      },
    };

    this.onModalClose = this.onModalClose.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onPerPage = this.onPerPage.bind(this);
  }
  render() {
    const {
      columns, data, modal, pagination, sortingColumns, search,
    } = this.state;
    let d = Search.search(data, columns, search);

    d = sorter.sort(d, sortingColumns, orderBy);

    const paginated = paginate(d, pagination);
    const pages = Math.ceil(data.length / Math.max(
      isNaN(pagination.perPage) ? 1 : pagination.perPage, 1)
    );

    return (
      <div>
        <PrimaryControls
          className="controls"
          perPage={pagination.perPage}
          columns={columns}
          data={this.state.data}
          onPerPage={this.onPerPage}
          onSearch={this.onSearch}
        />

        <Table
          className="pure-table pure-table-striped"
          columns={columns}
          data={paginated.data}
        >
          <Table.Header>
            <ColumnFilters columns={columns} onChange={this.onSearch} />
          </Table.Header>

          <Table.Body
            rowKey="id"
            row={(row, rowIndex) => ({
              className: rowIndex % 2 ? 'odd-row' : 'even-row',
              onClick: () => console.log('clicked row', row),
            })}
          />

          <CustomFooter />
        </Table>

        <div className="controls">
          <Paginator pagination={pagination} pages={pages} onSelect={this.onSelect} />
        </div>

        <Modal show={modal.show} title={modal.title} onCloseClicked={this.onModalClose}>
          {modal.content}
        </Modal>
      </div>
    );
  }
  onModalClose() {
    this.setState({
      modal: {
        ...this.state.modal,
        ...{
          show: false,
        },
      },
    });
  }
  onSearch(search) {
    this.setState({
      editedCell: null, // reset edits
      search,
    });
  }
  onSelect(page) {
    const pages = Math.ceil(
      this.state.data.length / this.state.pagination.perPage
    );

    this.setState({
      pagination: {
        ...this.state.pagination,
        page: Math.min(Math.max(page, 1), pages),
      },
    });
  }
  onPerPage(value) {
    this.setState({
      pagination: {
        ...this.state.pagination,
        perPage: parseInt(value, 10),
      },
    });
  }
}

/*
({ cellData }) => {
  const edit = () => {
    this.setState({
      modal: {
        show: true,
        title: 'Edit',
        content: <EditCell
          onSubmit={(formData) => {
            this.state.data[cellData.id] = formData;

            this.setState({
              modal: { ...this.state.modal, show: false },
              data: this.state.data,
            });
          }}
          onCancel={() => {
            this.setState({
              modal: {
                ...this.state.modal,
                ...{
                  show: false,
                },
              },
            });
          }}
          formData={cellData}
          properties={properties}
        />,
      },
    });
  };

  const remove = () => {
    // this could go through flux etc.
    this.state.data.splice(cellData.id, 1);

    this.setState({
      data: this.state.data,
    });
  };

  return (
    <div>
      <span
        className="edit"
        onClick={() => edit()} style={{ cursor: 'pointer' }}
      >
        &#8665;
      </span>
      <span
        className="remove"
        onClick={() => remove()} style={{ cursor: 'pointer' }}
      >
        &#10007;
      </span>
    </div>
  );
},
 */

export default FullTable;