/* eslint-disable react/prop-types */
import { createContext, useMemo, useState } from "react";
import "./App.css";
import { useContext } from "react";

// *******************************
// Regex List
// *******************************

// Direction
// i: Row, j: Column
// P: Positive, N: Negative
const D_JP = 0;
// const D_JN = 1;
const D_IP = 2;
const D_IN = 3;

// prettier-ignore
const _regexList = [
  // j positive
  { content: ".*H.*H.*", extractor: { i: 0, j: 0, d: D_JP } },
  { content: "(DI|NS|TH|OM)*", extractor: { i: 1, j: 0, d: D_JP } },
  { content: "F.*[AO].*[AO].*", extractor: { i: 2, j: 0, d: D_JP } },
  { content: "(O|RHH|MM)*", extractor: { i: 3, j: 0, d: D_JP } },
  { content: ".*", extractor: { i: 4, j: 0, d: D_JP } },
  { content: "C*MC(CCC|MM)*", extractor: { i: 5, j: 0, d: D_JP } },
  { content: "[^C]*[^R]*III.*", extractor: { i: 6, j: 0, d: D_JP } },
  { content: "(...?)\\1*", extractor: { i: 7, j: 0, d: D_JP } },
  { content: "([^X]|XCC)*", extractor: { i: 8, j: 0, d: D_JP } },
  { content: "(RR|HHH)*.?", extractor: { i: 9, j: 0, d: D_JP } },
  { content: "N.*X.X.X.*E", extractor: { i: 10, j: 0, d: D_JP } },
  { content: "R*D*M*", extractor: { i: 11, j: 0, d: D_JP } },
  { content: ".(C|HH)*", extractor: { i: 12, j: 0, d: D_JP } },
  // i positive left part
  { content: "(ND|ET|IN)[^X]*", extractor: { i: 0, j: 0, d: D_IP } },
  { content: "[CHMNOR]*I[CHMNOR]*", extractor: { i: 0, j: 1, d: D_IP } },
  { content: "P+(..)\\1.*", extractor: { i: 0, j: 2, d: D_IP } },
  { content: "(E|CR|MN)*", extractor: { i: 0, j: 3, d: D_IP } },
  { content: "([^MC]|MM|CC)*", extractor: { i: 0, j: 4, d: D_IP } },
  { content: "[AM]*CM(RC)*R?", extractor: { i: 0, j: 5, d: D_IP } },
  { content: ".*", extractor: { i: 0, j: 6, d: D_IP } },
  // i positive right part
  { content: ".*PRR.*DDC.*", extractor: { i: 1, j: 7, d: D_IP } },
  { content: "(HHX|[^HX])*", extractor: { i: 2, j: 8, d: D_IP } },
  { content: "([^EMC]|EM)*", extractor: { i: 3, j: 9, d: D_IP } },
  { content: ".*OXR.*", extractor: { i: 4, j: 10, d: D_IP } },
  { content: ".*LR.*RL.*", extractor: { i: 5, j: 11, d: D_IP } },
  { content: ".*SE.*UE.*", extractor: { i: 6, j: 12, d: D_IP } },
  // i negative right part
  { content: "(S|MM|HHH)*", extractor: { i: 6, j: 12, d: D_IN } },
  { content: "[^M]*M[^M]*", extractor: { i: 7, j: 11, d: D_IN } },
  { content: "(RX|[^R])*", extractor: { i: 8, j: 10, d: D_IN } },
  { content: "[CEIMU]*OH[AEMOR]*", extractor: { i: 9, j: 9, d: D_IN } },
  { content: ".*(.)C\\1X\\1.*", extractor: { i: 10, j: 8, d: D_IN } },
  { content: "[^C]*MMM[^C]*", extractor: { i: 11, j: 7, d: D_IN } },
  { content: ".*(IN|SE|HI)", extractor: { i: 12, j: 6, d: D_IN } },
  // i negative left part
  { content: ".*(.)(.)(.)(.)\\4\\3\\2\\1.*", extractor: { i: 12, j: 5, d: D_IN }, },
  { content: ".*XHCR.*X.*", extractor: { i: 12, j: 4, d: D_IN } },
  { content: ".*DD.*CCM.*", extractor: { i: 12, j: 3, d: D_IN } },
  { content: ".*XEXM*", extractor: { i: 12, j: 2, d: D_IN } },
  { content: "[CR]*", extractor: { i: 12, j: 1, d: D_IN } },
  { content: ".*G.*V.*H.*", extractor: { i: 12, j: 0, d: D_IN } },
];

const getBoardChar = (board, i, j) => {
  if (i < 0 || i > 12) return undefined;
  if (j < 0) return undefined;
  if (i <= 6 && j > 6 + i) return undefined;
  if (i > 6 && j > 18 - i) return undefined;

  return (board[i] ?? [])[j] ?? "_";
};

const getPath = (regexItem) => {
  const board = [[]];
  const path = [];
  let { i, j, d } = regexItem.extractor;

  if (d === D_JP) {
    while (getBoardChar(board, i, j)) {
      path.push([i, j]);
      j++;
    }
  } else if (d === D_IP) {
    while (getBoardChar(board, i, j)) {
      path.push([i, j]);
      i++;
      if (i >= 7) j--;
    }
  } else if (d === D_IN) {
    while (getBoardChar(board, i, j)) {
      path.push([i, j]);
      i--;
      if (i < 6) j--;
    }
  }

  return path;
};

const regexList = _regexList
  .map((r) => ({
    ...r,
    regex: new RegExp("^" + r.content + "$", "i"),
  }))
  .map((r) => ({
    ...r,
    path: getPath(r),
  }));

const hexToRegexList = (() => {
  const res = [];
  for (let regexId = 0; regexId < regexList.length; regexId++) {
    for (let [i, j] of regexList[regexId].path) {
      if (!res[i]) res[i] = [];
      if (!res[i][j]) res[i][j] = [];
      res[i][j].push(regexId);
    }
  }
  return res;
})();

// Line status
const LS_RIGHT = 0;
const LS_WRONG = 1;
const LS_INCOMPLETE = 2;

const testRegex = (regex, str) => {
  if (str.indexOf("_") !== -1) return LS_INCOMPLETE;
  return regex.test(str) ? LS_RIGHT : LS_WRONG;
};

const checkRegex = (board, regexItem) => {
  const regex = regexItem.regex;
  let { i, j, d } = regexItem.extractor;

  let str = "";
  if (d === D_JP) {
    while (getBoardChar(board, i, j)) {
      str += getBoardChar(board, i, j);
      j++;
    }
    return [str, testRegex(regex, str)];
  } else if (d === D_IP) {
    while (getBoardChar(board, i, j)) {
      str += getBoardChar(board, i, j);
      i++;
      if (i >= 7) j--;
    }
    return [str, testRegex(regex, str)];
  } else if (d === D_IN) {
    while (getBoardChar(board, i, j)) {
      str += getBoardChar(board, i, j);
      i--;
      if (i < 6) j--;
    }
    return [str, testRegex(regex, str)];
  }

  throw new Error("Invalid direction");
};

// *******************************
// App
// *******************************

const AppContext = createContext(null);

// Hex: a hexagon cell
const Hex = ({ cellIdx }) => {
  const { activeHex, setActiveHex, board, setWordForIndex, highlightPath } =
    useContext(AppContext);
  const char = board[cellIdx[0]][cellIdx[1]];

  const isActive =
    activeHex && activeHex[0] === cellIdx[0] && activeHex[1] === cellIdx[1];
  const highlightIndex = (highlightPath ?? []).findIndex(
    (x) => x[0] === cellIdx[0] && x[1] === cellIdx[1]
  );

  const activeClass = isActive ? "active" : "";
  const highlightedClass = `highlighted-${highlightIndex}`;
  const wordInInput = isActive ? "" : char ?? "";

  const setWord = (v) => {
    if (v !== null) {
      if (v.length !== 1) {
        v = null;
      } else {
        const code = v.charCodeAt(0);
        const isAlpha = (code > 64 && code < 91) || (code > 96 && code < 123);
        v = isAlpha ? v : null;
      }
    }
    setWordForIndex(cellIdx[0], cellIdx[1], v);
  };

  return (
    <div className="hex">
      <div className="top"></div>
      <div className="middle">
        <div className="hex-inner">
          <div className={`top ${activeClass} ${highlightedClass}`}></div>
          <div className={`middle ${activeClass} ${highlightedClass}`}>
            <input
              className="hex-input"
              onFocus={() => setActiveHex(cellIdx)}
              onBlur={() =>
                setActiveHex((prev) => {
                  if (prev[0] === cellIdx[0] && prev[1] === cellIdx[1])
                    return null;
                  return prev;
                })
              }
              value={wordInInput || ""}
              onChange={(e) => {
                const v = e.target.value?.toUpperCase();
                setWord(v);
                e.target.blur();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" || e.key === "Delete") {
                  setWord(null);
                  e.target.blur();
                }
              }}
            ></input>
          </div>
          <div className={`bottom ${activeClass} ${highlightedClass}`}></div>
        </div>
      </div>
      <div className="bottom"></div>
    </div>
  );
};

// HexRow: a row of hexagons
const HexRow = ({ itemCount, offset, rowIdx }) => {
  return (
    <div
      className="hex-row"
      style={{
        paddingLeft: offset ? `${offset * 53}px` : 0,
      }}
    >
      {Array.from({ length: itemCount }).map((_, index) => (
        <Hex key={index} cellIdx={[rowIdx, index]} />
      ))}
    </div>
  );
};

const baseOffset = 6;

function App() {
  const [board, setBoard] = useState(() => {
    const savedData = localStorage.getItem("board");
    let board;
    try {
      board = JSON.parse(savedData);
    } catch {
      localStorage.removeItem("board");
    }
    return board ?? Array.from({ length: 13 }).fill([]);
  });
  // the regex has mouse hover, used to highlight hex line
  const [highLightItem, setHighLightItem] = useState(-1);
  // the regex has mouse click
  const [stickHighlight, setStickHighlight] = useState(-1);
  // the hex in edit mode
  const [activeHex, setActiveHex] = useState(null);

  const setWordForIndex = (i, j, word) => {
    setBoard((prev) => {
      const newBoard = [...prev];
      const newLine = [...newBoard[i]];
      newLine[j] = word;
      newBoard[i] = newLine;
      localStorage.setItem("board", JSON.stringify(newBoard));
      return newBoard;
    });
  };

  const highlightPath = useMemo(() => {
    if (highLightItem === -1) {
      if (stickHighlight === -1) return [];
      return regexList[stickHighlight]["path"];
    }
    return regexList[highLightItem]["path"];
  }, [highLightItem, stickHighlight]);

  const activeRegexList = useMemo(() => {
    if (activeHex === null) return [];
    return hexToRegexList[activeHex[0]]?.[activeHex[1]] ?? [];
  }, [activeHex]);

  const contextValue = {
    activeHex,
    setActiveHex,
    board,
    setWordForIndex,
    highlightPath,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="header">
        <h1>Regex Crossword Puzzle</h1>
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => {
              const bordJSON = JSON.stringify(board);
              prompt("Copy to clipboard: Ctrl+C, Enter", bordJSON);
            }}
            style={{ marginRight: "10px" }}
          >
            Save
          </button>
          <button
            onClick={() => {
              const bordJSON = prompt("Paste board JSON here");
              if (bordJSON) {
                try {
                  const newBoard = JSON.parse(bordJSON);
                  setBoard(newBoard);
                  localStorage.setItem("board", JSON.stringify(newBoard));
                } catch {
                  alert("Invalid JSON");
                }
              }
            }}
            style={{ marginRight: "10px" }}
          >
            Load
          </button>
          <button
            onClick={() => {
              setBoard(Array.from({ length: 13 }).fill([]));
            }}
            style={{ marginRight: "10px" }}
          >
            Clear
          </button>
          <button>
            <a href="https://github.com/determ1ne/regex-crossword">GitHub</a>
          </button>
        </div>
      </div>
      <div className="crossword-container">
        {Array.from({ length: 7 }).map((_, i) => (
          <HexRow
            key={i}
            rowIdx={i}
            itemCount={i + 7}
            offset={baseOffset - i}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <HexRow
            key={i + 7}
            rowIdx={i + 7}
            itemCount={12 - i}
            offset={baseOffset + i - 5}
          />
        ))}
      </div>
      <h2>Regex List</h2>
      <div className="regex-list">
        {regexList.map((r, i) => {
          const [str, result] = checkRegex(board, r);
          return (
            <div
              key={i}
              className={`regex-item ${
                highLightItem === i || activeRegexList.indexOf(i) !== -1
                  ? "regex-active"
                  : ""
              }`}
              onClick={() => {
                setStickHighlight((prev) => {
                  if (prev === i) return -1;
                  return i;
                });
              }}
              onMouseOver={() => {
                setHighLightItem(i);
              }}
              onMouseOut={() => {
                setHighLightItem((prev) => {
                  if (prev === i) return -1;
                  return prev;
                });
              }}
            >
              <span className="regex-content">{r.content}</span>
              <span className="regex-extracted">
                {Array.from(str).map((v, i) => (
                  <span className="regex-input-char" key={i}>
                    {v}
                  </span>
                ))}
              </span>
              <span className="regex-result">
                {result === LS_RIGHT ? "✅" : result === LS_WRONG ? "❌" : "🚧"}
              </span>
            </div>
          );
        })}
      </div>
    </AppContext.Provider>
  );
}

export default App;
