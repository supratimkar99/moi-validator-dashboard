import React, { useEffect, useState, useRef } from 'react';
import { Button, Drawer, Space } from 'antd';

const ConsoleDisplayRedesigned = () => {
  const [consoleData, setConsoleData] = useState([]);
  const [open, setOpen] = useState(false);
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

  const handleClearConsole = () => {
    setConsoleData([]);
  };

  return (
    <>
      <button
        className="btn btn-48 btn-primary"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 100,
        }}
      >
        Show Console
      </button>
      <Drawer
        title="Console Data"
        placement={'right'}
        width={600}
        onClose={() => setOpen(false)}
        open={open}
        extra={
          <Space>
            <Button
              className="btn btn-32 btn-primary"
              onClick={handleClearConsole}
            >
              Clear
            </Button>
          </Space>
        }
      >
        <div ref={consoleRef}>
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
        </div>
      </Drawer>
    </>
  );
};

export default ConsoleDisplayRedesigned;
