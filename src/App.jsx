/* eslint-disable react/prop-types */
import { useState } from "react";
import "./App.css";
import { useMemo } from "react";

const isAlpha = (str) => {
  if (str.length !== 1) return false;
  const code = str.charCodeAt(0);
  return (code > 64 && code < 91) || (code > 96 && code < 123);
};

const Hex = ({ word, setWordCallback, highlighted }) => {
  const [isActive, setIsActive] = useState(false);

  const activeClass = isActive ? "active" : "";
  const highlightedClass = highlighted ? "highlighted" : "";
  const wordInInput = isActive ? "" : word;

  return (
    <div className="hex">
      <div className="top"></div>
      <div className="middle">
        <div className="hex-inner">
          <div className={`top ${activeClass} ${highlightedClass}`}></div>
          <div className={`middle ${activeClass} ${highlightedClass}`}>
            <input
              className="hex-input"
              onFocus={() => setIsActive(true)}
              onBlur={() => setIsActive(false)}
              value={wordInInput || ""}
              onChange={(e) => {
                const v = e.target.value.toUpperCase();
                if (isAlpha(v)) {
                  setWordCallback(v);
                }
                e.target.blur();
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

const HexRow = ({
  itemCount,
  offset,
  wordLine,
  callback,
  isHexHighlightedForRow,
}) => {
  const setWordForIndex = (j) => {
    return (word) => {
      callback(j, word);
    };
  };

  return (
    <div
      className="hex-row"
      style={{
        paddingLeft: offset ? `${offset * 53}px` : 0,
      }}
    >
      {Array.from({ length: itemCount }).map((_, index) => (
        <Hex
          key={index}
          word={wordLine[index]}
          setWordCallback={setWordForIndex(index)}
          highlighted={isHexHighlightedForRow(index)}
        />
      ))}
    </div>
  );
};

const baseOffset = 6;

const D_JP = 0;
// const D_JN = 1;
const D_IP = 2;
const D_IN = 3;

const _regexList = [
  //
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
  //
  { content: "(ND|ET|IN)[^X]*", extractor: { i: 0, j: 0, d: D_IP } },
  { content: "[CHMNOR]*I[CHMNOR]*", extractor: { i: 0, j: 1, d: D_IP } },
  { content: "P+(..)\\1.*", extractor: { i: 0, j: 2, d: D_IP } },
  { content: "(E|CR|MN)*", extractor: { i: 0, j: 3, d: D_IP } },
  { content: "([^MC]|MM|CC)*", extractor: { i: 0, j: 4, d: D_IP } },
  { content: "[AM]*CM(RC)*R?", extractor: { i: 0, j: 5, d: D_IP } },
  { content: ".*", extractor: { i: 0, j: 6, d: D_IP } },
  //
  { content: ".*PRR.*DDC.*", extractor: { i: 1, j: 7, d: D_IP } },
  { content: "(HHX|[^HX])*", extractor: { i: 2, j: 8, d: D_IP } },
  { content: "([^EMC]|EM)*", extractor: { i: 3, j: 9, d: D_IP } },
  { content: ".*OXR.*", extractor: { i: 4, j: 10, d: D_IP } },
  { content: ".*LR.*RL.*", extractor: { i: 5, j: 11, d: D_IP } },
  { content: ".*SE.*UE.*", extractor: { i: 6, j: 12, d: D_IP } },
  //
  { content: "(S|MM|HHH)*", extractor: { i: 6, j: 12, d: D_IN } },
  { content: "[^M]*M[^M]*", extractor: { i: 7, j: 11, d: D_IN } },
  { content: "(RX|[^R])*", extractor: { i: 8, j: 10, d: D_IN } },
  { content: "[CEIMU]*OH[AEMOR]*", extractor: { i: 9, j: 9, d: D_IN } },
  { content: ".*(.)C\\1X\\1.*", extractor: { i: 10, j: 8, d: D_IN } },
  { content: "[^C]*MMM[^C]*", extractor: { i: 11, j: 7, d: D_IN } },
  { content: ".*(IN|SE|HI)", extractor: { i: 12, j: 6, d: D_IN } },
  //
  {
    content: ".*(.)(.)(.)(.)\\4\\3\\2\\1.*",
    extractor: { i: 12, j: 5, d: D_IN },
  },
  { content: ".*XHCR.*X.*", extractor: { i: 12, j: 4, d: D_IN } },
  { content: ".*DD.*CCM.*", extractor: { i: 12, j: 3, d: D_IN } },
  { content: ".*XEXM*", extractor: { i: 12, j: 2, d: D_IN } },
  { content: "[CR]*", extractor: { i: 12, j: 1, d: D_IN } },
  { content: ".*G.*V.*H.*", extractor: { i: 12, j: 0, d: D_IN } },
];
const regexList = _regexList.map((r) => {
  return {
    ...r,
    regex: new RegExp("^" + r.content + "$", "i"),
  };
});

const getBoardChar = (board, i, j) => {
  if (i < 0 || i > 12) return undefined;
  if (j < 0) return undefined;
  if (i <= 6 && j > 6 + i) return undefined;
  if (i > 6 && j > 18 - i) return undefined;

  return (board[i] ?? [])[j] ?? "_";
};

const testRegex = (regex, str) => {
  if (str.indexOf("_") !== -1) return false;
  return regex.test(str);
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
  const [highLightItem, setHighLightItem] = useState(-1);

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

  const setWordForIndexRowed = (i) => {
    return (j, word) => {
      setWordForIndex(i, j, word);
    };
  };

  const highlightPath = useMemo(() => {
    if (highLightItem === -1) return [];
    return getPath(regexList[highLightItem]);
  }, [highLightItem]);

  const isHexHighlighted = (i, j) => {
    return highlightPath.some(([x, y]) => x === i && y === j);
  };

  const isHexHighlightedForRow = (i) => {
    return (j) => isHexHighlighted(i, j);
  };

  return (
    <>
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
      <form className="crossword-container">
        <HexRow
          itemCount={7}
          offset={baseOffset}
          wordLine={board[0]}
          callback={setWordForIndexRowed(0)}
          isHexHighlightedForRow={isHexHighlightedForRow(0)}
        />
        <HexRow
          itemCount={8}
          offset={baseOffset - 1}
          wordLine={board[1]}
          callback={setWordForIndexRowed(1)}
          isHexHighlightedForRow={isHexHighlightedForRow(1)}
        />
        <HexRow
          itemCount={9}
          offset={baseOffset - 2}
          wordLine={board[2]}
          callback={setWordForIndexRowed(2)}
          isHexHighlightedForRow={isHexHighlightedForRow(2)}
        />
        <HexRow
          itemCount={10}
          offset={baseOffset - 3}
          wordLine={board[3]}
          callback={setWordForIndexRowed(3)}
          isHexHighlightedForRow={isHexHighlightedForRow(3)}
        />
        <HexRow
          itemCount={11}
          offset={baseOffset - 4}
          wordLine={board[4]}
          callback={setWordForIndexRowed(4)}
          isHexHighlightedForRow={isHexHighlightedForRow(4)}
        />
        <HexRow
          itemCount={12}
          offset={baseOffset - 5}
          wordLine={board[5]}
          callback={setWordForIndexRowed(5)}
          isHexHighlightedForRow={isHexHighlightedForRow(5)}
        />
        <HexRow
          itemCount={13}
          offset={baseOffset - 6}
          wordLine={board[6]}
          callback={setWordForIndexRowed(6)}
          isHexHighlightedForRow={isHexHighlightedForRow(6)}
        />
        <HexRow
          itemCount={12}
          offset={baseOffset - 5}
          wordLine={board[7]}
          callback={setWordForIndexRowed(7)}
          isHexHighlightedForRow={isHexHighlightedForRow(7)}
        />
        <HexRow
          itemCount={11}
          offset={baseOffset - 4}
          wordLine={board[8]}
          callback={setWordForIndexRowed(8)}
          isHexHighlightedForRow={isHexHighlightedForRow(8)}
        />
        <HexRow
          itemCount={10}
          offset={baseOffset - 3}
          wordLine={board[9]}
          callback={setWordForIndexRowed(9)}
          isHexHighlightedForRow={isHexHighlightedForRow(9)}
        />
        <HexRow
          itemCount={9}
          offset={baseOffset - 2}
          wordLine={board[10]}
          callback={setWordForIndexRowed(10)}
          isHexHighlightedForRow={isHexHighlightedForRow(10)}
        />
        <HexRow
          itemCount={8}
          offset={baseOffset - 1}
          wordLine={board[11]}
          callback={setWordForIndexRowed(11)}
          isHexHighlightedForRow={isHexHighlightedForRow(11)}
        />
        <HexRow
          itemCount={7}
          offset={baseOffset}
          wordLine={board[12]}
          callback={setWordForIndexRowed(12)}
          isHexHighlightedForRow={isHexHighlightedForRow(12)}
        />
      </form>
      <h2>Regex List</h2>
      <div className="regex-list">
        {regexList.map((r, i) => {
          const [str, result] = checkRegex(board, r);
          return (
            <div
              key={i}
              className={`regex-item ${
                highLightItem === i ? "regex-active" : ""
              }`}
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
              <span className="regex-extracted">{str}</span>
              <span className="regex-result">{result ? "✅" : "❌"}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
