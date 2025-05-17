export const fullhouse = (ticket) => {
  const flattenedTicket = ticket.flat();

  // Check if every number in the flattened ticket is either 0 or -1
  const isFullHouse = flattenedTicket.every(num => num === 0 || num === -1);

  return isFullHouse;
};


export const fourcorners = (ticket) => {
  // Helper function to find the first and last non-zero numbers in a row
  const findFirstAndLastNonZero = (row) => {
    let first = null;
    let last = null;

    for (let i = 0; i < row.length; i++) {
      if (row[i] !== 0) {
        if (first === null) first = row[i]; // First non-zero number
        last = row[i]; // Last non-zero number (this will update to the last non-zero as we loop)
      }
    }

    return { first, last };
  };

  // Get first and last non-zero numbers for top and bottom rows
  const topRow = ticket[0];
  const bottomRow = ticket[2];

  const { first: topFirst, last: topLast } = findFirstAndLastNonZero(topRow);
  const { first: bottomFirst, last: bottomLast } = findFirstAndLastNonZero(bottomRow);

  // Check if both first and last non-zero numbers in top and bottom rows are -1
  if (topFirst === -1 && topLast === -1 && bottomFirst === -1 && bottomLast === -1) {
    return true;
  }

  return false;
};

export const TopLine = (ticket) => {
  const topLine = ticket[0];  // Get the top line of the ticket (first row)

  // Check if all numbers in the top line are either 0 or -1
  const isValidTopLine = topLine.every(num => num === 0 || num === -1);

  return isValidTopLine;
};

export const MidLine = (ticket) => {
  const topLine = ticket[1];  // Get the top line of the ticket (first row)

  // Check if all numbers in the top line are either 0 or -1
  const isValidTopLine = topLine.every(num => num === 0 || num === -1);

  return isValidTopLine;
};
export const BottomLine = (ticket) => {
  const topLine = ticket[2];  // Get the top line of the ticket (first row)

  // Check if all numbers in the top line are either 0 or -1
  const isValidTopLine = topLine.every(num => num === 0 || num === -1);

  return isValidTopLine;
};

export const countMinusOnes = (ticket) => {
  // Flatten the 2D ticket array and count the number of -1 values
  const flattenedTicket = ticket.flat();
  const minusOneCount = flattenedTicket.filter(num => num === -1).length;

  return minusOneCount;
};




