function generateTambolaTickets() {
  // 6 tickets, each 3 rows x 9 cols, 15 numbers each, unique across all tickets

  // Step 1: Prepare column ranges for tambola
  const colRanges = [
    [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
    [50, 59], [60, 69], [70, 79], [80, 90],
  ];

  // Step 2: Prepare all numbers in columns globally
  const globalColumnNumbers = colRanges.map(([start, end]) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i)
  );

  // Step 3: Total numbers needed = 6 tickets * 15 numbers = 90 numbers = all 1-90 exactly once
  // So globalColumnNumbers combined is exactly 90 numbers.

  // Step 4: For each ticket, assign number count per column such that:
  // - Each ticket has exactly 15 numbers.
  // - Each ticket's columns have at least one number (so no empty column).
  // - Each ticket's rows have exactly 5 numbers.
  // Since 9 columns x 6 tickets = 54 "at least one per column per ticket" = 54 numbers minimum,
  // The remaining 36 numbers fill up to 90 total numbers.

  // So, for each ticket, columns get assigned counts adding to 15, with each column count >=1.

  // We'll do the column count distribution per ticket first.

  // Helper to shuffle array
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // For each ticket, assign column counts (each column at least 1 number)
  // The sum of counts per ticket is 15.
  // Since 9 columns, minimum sum = 9 (all columns 1)
  // Remaining 6 numbers (15 - 9) can be distributed randomly.

  function assignColumnCounts() {
    const baseCounts = Array(9).fill(1); // each column at least one
    let remaining = 15 - 9;

    while (remaining > 0) {
      const idx = Math.floor(Math.random() * 9);
      baseCounts[idx]++;
      remaining--;
    }
    return baseCounts;
  }

  // Step 5: For all tickets, assign counts per column
  // Then check that total count per column across all tickets <= available numbers in that column

  let ticketsColumnCounts;
  while (true) {
    ticketsColumnCounts = [];
    for (let i = 0; i < 6; i++) {
      ticketsColumnCounts.push(assignColumnCounts());
    }
    // sum counts per column across tickets
    const sumPerColumn = Array(9).fill(0);
    for (let col = 0; col < 9; col++) {
      for (let t = 0; t < 6; t++) {
        sumPerColumn[col] += ticketsColumnCounts[t][col];
      }
    }

    // Check if sumPerColumn[col] <= total numbers in colRanges[col]
    let valid = true;
    for (let col = 0; col < 9; col++) {
      if (sumPerColumn[col] > globalColumnNumbers[col].length) {
        valid = false;
        break;
      }
    }
    if (valid) break; // good distribution
  }

  // Step 6: Now assign numbers to each ticket column from globalColumnNumbers without overlap

  // Clone globalColumnNumbers arrays to remove assigned numbers
  const remainingNumbersPerColumn = globalColumnNumbers.map(colArr => [...colArr]);

  // For each ticket, for each column, pick assigned count of numbers from remainingNumbersPerColumn[col]
  const ticketsNumbers = [];

  for (let t = 0; t < 6; t++) {
    const ticketCols = [];
    for (let col = 0; col < 9; col++) {
      const count = ticketsColumnCounts[t][col];
      // pick 'count' numbers from remainingNumbersPerColumn[col]
      const chosen = [];
      for (let i = 0; i < count; i++) {
        // random pick from remainingNumbersPerColumn[col]
        const idx = Math.floor(Math.random() * remainingNumbersPerColumn[col].length);
        chosen.push(remainingNumbersPerColumn[col][idx]);
        remainingNumbersPerColumn[col].splice(idx, 1);
      }
      chosen.sort((a, b) => a - b); // sort ascending in column
      ticketCols.push(chosen);
    }
    ticketsNumbers.push(ticketCols);
  }

  // Step 7: Arrange numbers into 3 rows x 9 cols per ticket
  // Each column has ticketsColumnCounts[t][col] numbers, distribute them across 3 rows so that
  // each row has exactly 5 numbers total.
  // Rules:
  // - Each row: 5 numbers
  // - Each column: numbers assigned in ascending order top to bottom
  // - No empty columns (already ensured)

  // We'll create empty 3x9 ticket with zeros
  // Then assign numbers column-wise top to bottom

  function createEmptyTicket() {
    return Array.from({ length: 3 }, () => Array(9).fill(0));
  }

  // To distribute counts per column across rows, we assign 1 number per row per column until counts exhausted

  function distributeNumbers(ticketCols, counts) {
    const ticket = createEmptyTicket();

    // First, assign 1 number per row per column in round robin fashion until counts exhausted

    // Initialize counts left per column
    const countsLeft = [...counts];
    // Initialize how many numbers assigned per row (need exactly 5)
    const assignedPerRow = [0, 0, 0];

    // We'll assign numbers column-wise top to bottom
    for (let col = 0; col < 9; col++) {
      const nums = ticketCols[col];
      // assign nums to rows starting from top row 0 to 2
      for (let i = 0; i < nums.length; i++) {
        if (!ticket[i]) ticket[i] = new Array(9).fill(null); // ensures row exists
        ticket[i][col] = nums[i];
      }

    }

    // Now each row may have more or less than 5 numbers
    // Fix rows with less than 5 by moving numbers from rows with more than 5 if possible
    // But with this strict approach, row sums may not be 5 exactly

    // So instead, a better approach:

    // We'll try to assign numbers row-wise, respecting column counts and ensuring row counts =5

    // Alternative approach:

    // For each ticket:
    // Step A: For each column, decide which rows will get numbers (number of rows = column count)
    // Step B: For each row, sum assigned columns = 5

    // This is a constraint satisfaction problem.

    // We'll solve with backtracking.

    // Let's implement backtracking assignment.

    const ticketResult = createEmptyTicket();

    // counts: array of column counts
    // ticketCols: array of arrays of numbers per column (sorted)

    // rowCounts: number of assigned numbers per row
    const rowCounts = [0, 0, 0];

    // colCountsLeft: counts per column left to assign
    const colCountsLeft = [...counts];

    // assignment: ticketResult[row][col] = number or 0

    function backtrack(col = 0) {
      if (col === 9) {
        // all columns assigned, check row counts
        return rowCounts.every(c => c === 5);
      }

      const countInCol = counts[col];

      // Generate all possible ways to assign countInCol numbers to 3 rows
      // Each row gets either 0 or 1 number from this column (since max countInCol <=3)
      // Actually countInCol can be >3, but in tambola max per column is 3 (since rows=3)
      // So countInCol <=3

      // Generate all combinations of rows choosing countInCol
      const rows = [0, 1, 2];
      const combos = getCombinations(rows, countInCol);

      for (const combo of combos) {
        // Check if assigning numbers to these rows keeps rowCounts <=5
        let canAssign = true;
        for (const r of combo) {
          if (rowCounts[r] + 1 > 5) {
            canAssign = false;
            break;
          }
        }
        if (!canAssign) continue;

        // Assign numbers
        for (let i = 0; i < 3; i++) {
          ticketResult[i][col] = 0; // reset
        }

        const numbers = ticketCols[col];
        if (combo.length > numbers.length) continue; // skip invalid

        for (let i = 0; i < combo.length; i++) {
          const r = combo[i];
          ticketResult[r][col] = numbers[i];
          rowCounts[r]++;
        }


        if (backtrack(col + 1)) return true;

        // backtrack assignment
        for (const r of combo) {
          ticketResult[r][col] = 0;
          rowCounts[r]--;
        }
      }

      return false;
    }

    // helper to get combinations
    function getCombinations(arr, k) {
      const results = [];
      function combi(start, path) {
        if (path.length === k) {
          results.push([...path]);
          return;
        }
        for (let i = start; i < arr.length; i++) {
          path.push(arr[i]);
          combi(i + 1, path);
          path.pop();
        }
      }
      combi(0, []);
      return results;
    }

    const success = backtrack(0);
   if (!success) {
  console.log("Column data:", columnData);
  console.log("Current ticket state:", ticket);
  throw new Error("Failed to assign numbers to rows respecting constraints");
}


    return ticketResult;
  }

  // Step 8: Create all tickets grids

  const tickets = [];

  for (let t = 0; t < 6; t++) {
    const ticketGrid = distributeNumbers(ticketsNumbers[t], ticketsColumnCounts[t]);
    tickets.push(ticketGrid);
  }

  return tickets;
}

export function generateTambolaTicketsWithRetry(maxRetries = 20) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return generateTambolaTickets();
    } catch (err) {
      console.warn(`Retrying ticket generation: Attempt ${i + 1}`);
    }
  }
  throw new Error("Ticket generation failed after multiple attempts");
}




