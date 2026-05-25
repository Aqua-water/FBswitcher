const FACES = ["U", "D", "F", "B", "L", "R"];

function applyCycle(value, cycle) {
  const index = cycle.indexOf(value);
  if (index === -1) return value;
  return cycle[(index + 1) % cycle.length];
}

function applyBasicOperation(state, op) {
  const cycles = {
    x: ["F", "U", "B", "D"],
    y: ["F", "L", "B", "R"],
    z: ["U", "R", "D", "L"],
  };

  const cycle = cycles[op];
  if (!cycle) {
    throw new Error(`未知基础操作: ${op}`);
  }

  return [
    applyCycle(state[0], cycle),
    applyCycle(state[1], cycle),
  ];
}

function parseOperation(op) {
  if (!op) {
    throw new Error("操作不能为空");
  }

  const symbol = op[0];
  const suffix = op.slice(1);

  let rawTimes;

  if (suffix === "") {
    rawTimes = 1;
  } else if (suffix === "2") {
    rawTimes = 2;
  } else if (suffix === "-") {
    rawTimes = 3;
  } else if (suffix === "2-") {
    rawTimes = 2;
  } else {
    throw new Error(`非法操作记号: ${op}`);
  }

  const operationMap = {
    z: ["z", false],
    f: ["z", false],
    S: ["z", false],

    b: ["z", true],

    y: ["y", false],
    u: ["y", false],

    d: ["y", true],
    E: ["y", true],

    x: ["x", false],
    r: ["x", false],

    l: ["x", true],
    M: ["x", true],
  };

  if (!(symbol in operationMap)) {
    throw new Error(`未知操作符号: ${symbol}`);
  }

  const [basicOp, isReverse] = operationMap[symbol];

  const times = isReverse ? (4 - rawTimes) % 4 : rawTimes;

  return [basicOp, times];
}

function isDefinedOperation(op) {
  try {
    parseOperation(op);
    return true;
  } catch {
    return false;
  }
}

function applyOperation(state, op) {
  const [basicOp, times] = parseOperation(op);

  let result = state;

  for (let i = 0; i < times; i++) {
    result = applyBasicOperation(result, basicOp);
  }

  return result;
}

function isValidState(state) {
  const pair = new Set(state);

  const invalidPairs = [
    new Set(["U", "D"]),
    new Set(["L", "R"]),
    new Set(["B", "F"]),
  ];

  return !invalidPairs.some(invalid => {
    if (pair.size !== invalid.size) return false;
    for (const item of pair) {
      if (!invalid.has(item)) return false;
    }
    return true;
  });
}

function transform(FBcolor, Dcolor, operations) {
  const colorMap = {
    白: "U",
    黄: "D",
    绿: "F",
    蓝: "B",
    橙: "L",
    红: "R",
  };

  if (!(FBcolor in colorMap)) {
    throw new Error(`未知颜色: ${FBcolor}`);
  }

  if (!(Dcolor in colorMap)) {
    throw new Error(`未知颜色: ${Dcolor}`);
  }

  let state = [colorMap[FBcolor], colorMap[Dcolor]];

  for (const op of operations) {
    state = applyOperation(state, op);
  }

  return state;
}

function sameState(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function findExtraOperations(state, target = ["L", "D"]) {
  if (!isValidState(state)) {
    return null;
  }

  const outputOps = [
    "x", "x2", "x-",
    "y", "y2", "y-",
    "z", "z2", "z-",
  ];

  if (sameState(state, target)) {
    return [];
  }

  for (const op1 of outputOps) {
    const state1 = applyOperation(state, op1);

    if (sameState(state1, target)) {
      return [op1];
    }
  }

  for (const op1 of outputOps) {
    const state1 = applyOperation(state, op1);

    for (const op2 of outputOps) {
      const state2 = applyOperation(state1, op2);

      if (sameState(state2, target)) {
        return [op1, op2];
      }
    }
  }

  return null;
}

function solveOperations(FBcolor, Dcolor, operations) {
  const state = transform(FBcolor, Dcolor, operations);
  return findExtraOperations(state);
}

function extractOperationsFromUrl(url) {
  const startMarker = "?setup=";
  const startIndex = url.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error("网址中没有找到 ?setup=");
  }

  let rawPart = url.slice(startIndex + startMarker.length);

  rawPart = rawPart.replace("&alg=", "_");

  rawPart = rawPart.replace(/&[a-zA-Z0-9_%-]+=/g, "_");

  rawPart = rawPart.replace(/%2F%2F.*?(?:%0A|$)/g, "_");

  const tokens = rawPart.split("_");

  const operations = [];

  for (const token of tokens) {
    if (!token) continue;

    if (isDefinedOperation(token)) {
      operations.push(token);
    }
  }

  return operations;
}

function makeSetupPrefix(operations) {
  if (!operations || operations.length === 0) {
    return "";
  }

  return operations.join("_") + "_";
}

function insertExtraOperationsIntoSetup(url, extraOperations) {
  const setupMarker = "?setup=";
  const index = url.indexOf(setupMarker);

  if (index === -1) {
    throw new Error("网址中没有找到 ?setup=");
  }

  const insertIndex = index + setupMarker.length;
  const prefix = makeSetupPrefix(extraOperations);

  return url.slice(0, insertIndex) + prefix + url.slice(insertIndex);
}

function identityPerm() {
  const perm = {};
  for (const face of FACES) {
    perm[face] = face;
  }
  return perm;
}

function operationToPerm(op) {
  const perm = {};

  for (const face of FACES) {
    const newState = applyOperation([face, face], op);
    perm[face] = newState[0];
  }

  return perm;
}

function composePerm(first, second) {
  const result = {};

  for (const face of FACES) {
    result[face] = second[first[face]];
  }

  return result;
}

function invertPerm(perm) {
  const result = {};

  for (const key of Object.keys(perm)) {
    result[perm[key]] = key;
  }

  return result;
}

function operationsToPerm(operations) {
  let perm = identityPerm();

  for (const op of operations) {
    const opPerm = operationToPerm(op);
    perm = composePerm(perm, opPerm);
  }

  return perm;
}

function permKey(perm) {
  return FACES.map(face => perm[face]).join(",");
}

function buildStandardOperationTable(maxDepth = 3) {
  const outputOps = [
    "x", "x2", "x-",
    "y", "y2", "y-",
    "z", "z2", "z-",
  ];

  const table = new Map();

  const identity = identityPerm();
  table.set(permKey(identity), []);

  let frontier = [
    {
      seq: [],
      perm: identity,
    },
  ];

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextFrontier = [];

    for (const item of frontier) {
      for (const op of outputOps) {
        const newSeq = [...item.seq, op];
        const opPerm = operationToPerm(op);
        const newPerm = composePerm(item.perm, opPerm);
        const key = permKey(newPerm);

        if (!table.has(key)) {
          table.set(key, newSeq);
          nextFrontier.push({
            seq: newSeq,
            perm: newPerm,
          });
        }
      }
    }

    frontier = nextFrontier;
  }

  return table;
}

const STANDARD_OPERATION_TABLE = buildStandardOperationTable();

function conjugateExtraOperations(fullOperations, extraOperations) {
  const mPerm = operationsToPerm(fullOperations);
  const nPerm = operationsToPerm(extraOperations);
  const mInvPerm = invertPerm(mPerm);

  const lPerm = composePerm(
    composePerm(mPerm, nPerm),
    mInvPerm
  );

  const key = permKey(lPerm);

  if (!STANDARD_OPERATION_TABLE.has(key)) {
    throw new Error("无法转换");
  }

  return STANDARD_OPERATION_TABLE.get(key);
}

function solveUrl(FBcolor, Dcolor, url) {
  const fullOperations = extractOperationsFromUrl(url);

  const extraOperationsN = solveOperations(
    FBcolor,
    Dcolor,
    fullOperations
  );

  if (extraOperationsN === null) {
    return null;
  }

  const extraOperationsL = conjugateExtraOperations(
    fullOperations,
    extraOperationsN
  );

  return insertExtraOperationsIntoSetup(url, extraOperationsL);
}

window.FBSwitcher = {
  solveUrl,
};