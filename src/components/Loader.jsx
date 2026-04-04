export default function Loader({ message = "Loading...", className = "", size = "medium" }) {
  const ringSize = size === "small" ? 40 : size === "large" ? 72 : 56;
  return (
    <div className={`loader-shell ${className}`.trim()}>
      <div className="loader-ring" style={{ width: ringSize, height: ringSize }}></div>
      <div className="loader-content">
        <div className="loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}
