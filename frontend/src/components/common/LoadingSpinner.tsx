interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading..."
}) => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      minHeight: '200px',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    message: {
      marginTop: '20px',
      fontSize: '16px',
      color: '#666',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message}</p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;