import React from "react";
import "./App.css";

const SIDE = Object.freeze({
  WHITE: "WHITE",
  BLACK: "BLACK",
});

const SQUARE = Object.freeze({
  WHITE: "#dcdcdc",
  BLACK: "#09292c",
  OK: "#00c946",
  WRONG: "red",
});

const GameScreens = Object.freeze({
  MENU: "MENU",
  BOARD: "BOARD",
  END: "END",
});

const GAME_SECONDS = 60;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomPiecesColor = () => {
  return Math.random() < 0.5 ? SIDE.WHITE : SIDE.BLACK;
};

const randomCoordinates = () => {
  return new Coordinates(getRandomInt(0, 7), getRandomInt(0, 7));
};

class Clock extends React.Component {
  constructor(props) {
    super();
    this.state = {
      seconds: props.seconds,
    };
  }

  componentDidMount = () => {
    this.interval = setInterval(() => {
      this.setState((prevState) => {
        return {
          seconds: prevState.seconds - 1,
        };
      });
      if (this.state.seconds <= 0) {
        this.props.onDone();
        clearInterval(this.interval);
      }
    }, 1000);
  };

  componentWillUnmount = () => {
    clearInterval(this.interval);
  };

  render = () => {
    const { seconds } = this.state;
    let minutes = Math.floor(seconds / 60);
    return (
      <div id={"clock"}>
        {minutes}:{seconds % 60}
      </div>
    );
  };
}

class Coordinates {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toChessBoardSquare = (perspective) => {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    switch (perspective) {
      case SIDE.WHITE:
        return letters[this.x] + `${8 - this.y}`;
      case SIDE.BLACK:
        return letters[7 - this.x] + `${this.y + 1}`;
      default:
        return "";
    }
  };
}

const MainMenuScreen = ({ highScore, changeScreen }) => {
  return (
    <div style={{ textAlign: "center" }}>
      <div id="gameTitle">CHESS BOARD MASTER</div>
      <StartButton
        style={{ fontSize: "40px", width: "200px" }}
        onClick={() => changeScreen(GameScreens.BOARD)}
        text={"START"}
      />
      <div id="highScore">{highScore}</div>
    </div>
  );
};

class GameScreen extends React.Component {
  constructor(props) {
    super();
    this.state = {
      color: randomPiecesColor(),
      target: randomCoordinates(),
    };
  }

  correct = () => {
    this.props.incScore();
    this.setState({
      color: randomPiecesColor(),
      target: randomCoordinates(),
    });
  };

  render = () => {
    const { color, target } = this.state;
    const square = target.toChessBoardSquare(color);
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "30px",
              color: color === SIDE.WHITE ? SQUARE.WHITE : SQUARE.BLACK,
            }}
          >
            {color}
          </div>
          <div
            style={{
              fontSize: "50px",
              marginLeft: "-60px",
              color: color === SIDE.WHITE ? SQUARE.WHITE : SQUARE.BLACK,
            }}
          >
            {square}
          </div>
          <div style={{ fontSize: "50px", color: SQUARE.OK }}>
            {this.props.score}
          </div>
        </div>
        <GameBoard target={target} onCorrect={this.correct} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Clock
            onDone={() => this.props.changeScreen(GameScreens.END)}
            seconds={GAME_SECONDS}
          />
          <ExitButton
            onClick={() => this.props.changeScreen(GameScreens.END)}
            text={"QUIT"}
          />
        </div>
      </div>
    );
  };
}

class GameBoard extends React.Component {
  componentDidMount = () => {
    const ctx = this.canvasRef.getContext("2d");

    console.log(this.props.target)

    for (let i = 0; i < 8; i++) {
      let color = i % 2 === 0 ? SQUARE.WHITE : SQUARE.BLACK;
      ctx.fillStyle = color;
      for (let j = 0; j < 8; j++) {
        ctx.fillRect(j * 80, i * 80, 80, 80);
        if (j == this.props.target.x && i == this.props.target.y) {
          ctx.fillStyle = SQUARE.OK;
          ctx.fillRect(j * 80, i * 80, 80, 80);
        }
        color = color === SQUARE.WHITE ? SQUARE.BLACK : SQUARE.WHITE;
        ctx.fillStyle = color;
      }
    }
  };

  onClick = (e) => {
    const { target } = this.props;
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 80);
    const y = Math.floor((e.clientY - rect.top) / 80);

    let color = SQUARE.BLACK;
    if (y % 2 === 0 && x % 2 === 0) {
      color = SQUARE.WHITE;
    }
    if (y % 2 !== 0 && x % 2 !== 0) {
      color = SQUARE.WHITE;
    }

    const ctx = this.canvasRef.getContext("2d");
    if (target.x === x && target.y === y) {
      ctx.fillStyle = SQUARE.OK;
      ctx.fillRect(x * 80, y * 80, 80, 80);
      setTimeout(() => {
        this.props.onCorrect();
        ctx.fillStyle = color;
        ctx.fillRect(x * 80, y * 80, 80, 80);
      }, 200);
    } else {
      ctx.fillStyle = SQUARE.WRONG;
      ctx.fillRect(x * 80, y * 80, 80, 80);
      setTimeout(() => {
        ctx.fillStyle = color;
        ctx.fillRect(x * 80, y * 80, 80, 80);
      }, 200);
    }
  };

  render = () => {
    return (
      <div>
        <canvas
          id={"board-canvas"}
          ref={(el) => (this.canvasRef = el)}
          onClick={this.onClick}
          width={640}
          height={640}
          style={{ cursor: "pointer" }}
        />
      </div>
    );
  };
}

const GameOverScreen = ({ score, isNewHighScore, changeScreen }) => {
  return (
    <div style={{ "text-align": "center" }}>
      <div id="gameTitle">CHESS BOARD MASTER</div>
      <div>
        {isNewHighScore && (
          <div style={{ fontSize: "25px" }}>New High Score!</div>
        )}
        <div id={"highScore"} style={{ color: SQUARE.OK }}>
          {score}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <StartButton
          style={{ width: "200px" }}
          onClick={() => changeScreen(GameScreens.BOARD)}
          text="RETRY"
        />
        <ExitButton
          style={{ fontSize: "25px", marginTop: "20px" }}
          onClick={() => changeScreen(GameScreens.MENU)}
          text={"EXIT"}
        />
      </div>
    </div>
  );
};

const StartButton = ({ onClick, text, style = {} }) => {
  return (
    <a href="#" className="button startButton" onClick={onClick} style={style}>
      {text}
    </a>
  );
};

const ExitButton = ({ onClick, text, style = {} }) => {
  return (
    <a href="#" className="button exitButton" onClick={onClick} style={style}>
      {text}
    </a>
  );
};

class App extends React.Component {
  constructor(props) {
    super();
    this.state = {
      score: 0,
      highScore: parseInt(localStorage.getItem("highScore") || 0),
      isNewHighScore: false,
      screen: GameScreens.MENU,
    };
  }

  changeScreen = (screen) => {
    this.setState((prevState) => {
      return {
        screen: screen,
        isNewHighScore:
          screen !== GameScreens.END ? false : prevState.isNewHighScore,
        score: screen === GameScreens.BOARD ? 0 : prevState.score,
      };
    });
  };

  incScore = () => {
    this.setState((prevState) => {
      const newScore = prevState.score + 1;
      const isNewHighScore = newScore > prevState.highScore;
      if (isNewHighScore) {
        localStorage.setItem("highScore", newScore.toString());
      }
      return {
        score: newScore,
        highScore: isNewHighScore ? newScore : prevState.highScore,
        isNewHighScore: isNewHighScore,
      };
    });
  };

  render = () => {
    switch (this.state.screen) {
      case GameScreens.BOARD:
        return (
          <div id={"gameScreenContainer"}>
            <GameScreen
              score={this.state.score}
              incScore={this.incScore}
              changeScreen={this.changeScreen}
            />
          </div>
        );
      case GameScreens.END:
        return (
          <div id={"app"}>
            <GameOverScreen
              score={this.state.score}
              isNewHighScore={this.state.isNewHighScore}
              highScore={this.state.highScore}
              changeScreen={this.changeScreen}
            />
          </div>
        );
      default:
        return (
          <div id={"app"}>
            <MainMenuScreen
              highScore={this.state.highScore}
              changeScreen={this.changeScreen}
            />
          </div>
        );
    }
  };
}

export default App;
