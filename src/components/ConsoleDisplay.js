import React, { useEffect, useState, useRef } from 'react';

const ConsoleDisplay = () => {
  const [consoleData, setConsoleData] = useState([]);
  const consoleRef = useRef(null);

  useEffect(() => {
    const originalConsoleLog = console.log;

    console.log = (...args) => {
      originalConsoleLog(...args); // Preserve original functionality
      setConsoleData((prevData) => [...prevData, args.join(' ')]);
    };

    return () => {
      console.log = originalConsoleLog; // Restore original console.log when component unmounts
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the console display
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleData]);

  const handleClearConsole = () => {
    setConsoleData([]);
  };

  return (
    <div
      className="console-display"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 1)',
        padding: '10px',
        zIndex: 9999,
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
        borderRadius: '0 0 0 10px',
        width: '70%', // Adjust the maximum width to fit the content properly
        maxHeight: '160px', // Adjust the maximum height to prevent it from taking too much space
        overflow: 'auto', // Enable scrolling if the content exceeds the maximum width
        textAlign: 'right',
      }}
      ref={consoleRef}
    >
      <div
        style={{
          paddingLeft: '20px',
          position: 'sticky',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <p
          style={{
            textAlign: 'left',
            fontWeight: '700',
            margin: '0px',
            paddingRight: '24px',
          }}
        >
          Console Data
        </p>
      </div>
      <div
        style={{
          textAlign: 'left',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '10px',
        }}
      >
        {consoleData.map((log, index) => (
          <p
            style={{
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '10px',
              lineHeight: '12px',
            }}
            key={index}
          >
            {log}
          </p>
        ))}
      </div>
      <button onClick={handleClearConsole} className="clear-button">
        Clear
      </button>
    </div>
  );
};

export default ConsoleDisplay;
