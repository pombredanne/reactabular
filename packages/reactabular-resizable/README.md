`reactabular-resizable` implements a formatter that provides handles for altering column widths. It provides a single function, `resizableColumn`, that accepts `onDrag` callback. You should adjust your column width using it.

Note that the current implementation doesn't constrain the total width of the table. That would require additional logic as you would have to check for this while altering a column width.

## How to Use?

The following example adjusts column widths through CSS to keep the performance high while using a sticky header/body. This way we can avoid touching the DOM through React and let the browser do the work.

```jsx
/*
import React from 'react';
import { Table, Sticky, resizableColumn } from 'reactabular';
// import resizableColumn from 'reactabular-resizable';
import uuid from 'uuid';
import * as stylesheet from 'stylesheet-helpers';
import { generateRows } from './helpers';
*/

const schema = {
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    address: {
      type: 'string'
    },
    age: {
      type: 'integer'
    }
  },
  required: ['id', 'name', 'age']
};
const rows = generateRows(100, schema);

class ResizableColumnsTable extends React.Component {
  constructor(props) {
    super(props);

    // Generate a unique id for the instance so we
    // don't get clashing class names for resizing.
    this.id = uuid.v4();

    this.state = {
      columns: this.getColumns(),
      rows
    };

    this.tableHeader = null;
    this.tableBody = null;
  }
  componentDidMount() {
    // Create a custom stylesheet for tracking styles.
    // Without creating a custom one we would need to modify
    // an existing one.
    //
    // This can fail on old IE due to low maximum stylesheet limit.
    const { styleSheetElement, styleSheet } = stylesheet.create();

    this.styleSheetElement = styleSheetElement;
    this.styleSheet = styleSheet;

    // Patch the column definition with class names.
    this.setState({
      columns: this.initializeStyle(this.state.columns)
    });
  }
  componentWillUnmount() {
    this.styleSheetElement.remove();
  }
  initializeStyle(columns) {
    return columns.map((column, i) => {
      const className = this.getClassName(column, i);

      stylesheet.updateProperties(
        this.styleSheet,
        className,
        {
          width: `${column.width}px`,
          minWidth: `${column.width}px`
        }
      );

      return {
        props: {
          className
        },
        ...column
      };
    });
  }
  getColumns() {
    const resizable = resizableColumn({
      onDrag: (width, { columnIndex }) => {
        const columns = this.state.columns;
        const column = columns[columnIndex];

        // Update the width of the changed column class
        stylesheet.updateProperties(
          this.styleSheet,
          this.getClassName(column, columnIndex),
          {
            width: `${width}px`,
            minWidth: `${width}px`
          }
        );
      }
    });

    return [
      {
        header: {
          label: 'Name',
          format: resizable
        },
        cell: {
          property: 'name'
        },
        // Track style on CSS level (not React)
        width: 200
      },
      {
        header: {
          label: 'Really Long Address Header',
          format: resizable
        },
        cell: {
          property: 'address'
        },
        width: 400
      },
      {
        header: {
          label: 'Age'
        },
        cell: {
          property: 'age'
        },
        width: 200
      }
    ];
  }
  getClassName(column, i) {
    return `column-${this.id}-${i}`;
  }
  render() {
    const { rows, columns } = this.state;
    const tableHeaderWidth = this.tableHeader && this.tableHeader.scrollWidth;
    const tableBodyWidth = this.tableBody && this.tableBody.scrollWidth;
    const scrollOffset = tableHeaderWidth - tableBodyWidth;

    return (
      <Table.Provider
        className="pure-table pure-table-striped"
        columns={columns}
        style={{ width: 'auto' }}
      >
        <Sticky.Header
          style={{
            maxWidth: 800
          }}
          ref={tableHeader => {
            if (tableHeader) {
              this.tableHeader = ReactDOM.findDOMNode(tableHeader);
            }
          }}
          tableBody={this.tableBody}
        />

        <Sticky.Body
          rows={rows}
          rowKey="id"
          onRow={this.onRow}
          style={{
            paddingRight: scrollOffset,
            maxWidth: 800,
            maxHeight: 400
          }}
          ref={tableBody => {
            if (tableBody) {
              this.tableBody = ReactDOM.findDOMNode(tableBody);
            }
          }}
          tableHeader={this.tableHeader}
        />
      </Table.Provider>
    );
  }
  onRow(row, rowIndex) {
    return {
      className: rowIndex % 2 ? 'odd-row' : 'even-row',
    };
  }
}

<ResizableColumnsTable />
```
