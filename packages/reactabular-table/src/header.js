import React from 'react';
import { tableHeaderContextTypes } from './types';
import {
  evaluateTransforms, mergePropPair
} from 'reactabular-utils';

// This has to be a React component instead of a function.
// Otherwise refs won't work.
export default class Header extends React.Component { // eslint-disable-line max-len, react/prefer-stateless-function
  render() {
    const { children, ...props } = this.props;
    const { headerRows, components } = this.context;

    return React.createElement(
      components.header.wrapper,
      props,
      [headerRows.map((row, i) =>
        React.createElement(HeaderRow, {
          key: `${i}-header-row`,
          components: components.header,
          row
        })
      )].concat(children)
    );
  }
}
Header.propTypes = {
  children: React.PropTypes.any
};
Header.contextTypes = tableHeaderContextTypes;

const HeaderRow = ({ row, components }) => (
  React.createElement(
    components.row,
    {},
    row.map(({ column, header = {}, props = {} }, j) => {
      const {
        label,
        transforms = [],
        format = a => a
      } = header;
      const extraParameters = {
        columnIndex: j,
        column
      };
      const transformedProps = evaluateTransforms(transforms, label, extraParameters);

      if (!transformedProps) {
        console.warn('Table.Header - Failed to receive a transformed result'); // eslint-disable-line max-len, no-console
      }

      return React.createElement(
        components.cell,
        {
          key: `${j}-header`,
          ...mergePropPair(props, transformedProps)
        },
        transformedProps.children || format(label, extraParameters)
      );
    })
  )
);
HeaderRow.propTypes = {
  row: React.PropTypes.arrayOf(React.PropTypes.object),
  components: React.PropTypes.object
};
