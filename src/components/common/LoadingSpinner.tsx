interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading..."
}) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};
export default LoadingSpinner;