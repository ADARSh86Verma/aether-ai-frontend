import "./CodingLoader.scss";

export default function CodingLoader() {
  return (
    <div className="coding-loader">
      <div className="terminal">
        <div className="terminal-header">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>

        <div className="terminal-body">
          <div className="line">
            <span className="cursor">$</span>
            <span className="typing">
              Generating code...
            </span>
          </div>

          <div className="progress">
            <div className="progress-bar"></div>
          </div>

          <div className="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}