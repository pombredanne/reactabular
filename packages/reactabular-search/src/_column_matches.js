import strategies from './strategies';

const _columnMatches = ({
  query,
  column = { cell: {} },
  row,
  strategy = strategies.infix,
  transform = (v = '') => v && v.toLowerCase && v.toLowerCase()
}) => {
  const property = column.cell.property;
  // Pick resolved value by convention
  const resolvedValue = String(row[`_${property}`] || row[property]);

  return strategy(transform(query)).evaluate(transform(resolvedValue));
};

export default _columnMatches;
