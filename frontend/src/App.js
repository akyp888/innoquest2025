// File: frontend/src/App.js
import React, { useState, useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import './App.css';
import yaml from 'js-yaml';
import CodeMirror from '@uiw/react-codemirror';
import { yaml as yamlLang } from '@codemirror/lang-yaml';

function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [userStories, setUserStories] = useState('');
  const [swaggerSpec, setSwaggerSpec] = useState('');
  const [yamlText, setYamlText] = useState('');
  const [zipUrl, setZipUrl] = useState(null);
  const [promptError, setPromptError] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const bottomRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    try {
      const parsed = yaml.load(yamlText);
      if (parsed) setSwaggerSpec(JSON.stringify(parsed));
    } catch (e) {
      console.error('Invalid YAML');
    }
  }, [yamlText]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setPromptError('Please enter a prompt to generate Swagger specs and user stories.');
      return;
    } else {
      setPromptError('');
    }

    setMessages([...messages, { role: 'user', content: prompt }]);
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: 'User stories and Swagger spec generated.' }]);
      setUserStories(data.user_stories);

      const yamlResponse = await fetch('http://localhost:8000/swagger-yaml');
      const yamlTextData = await yamlResponse.text();
      setYamlText(yamlTextData);

      try {
        const parsed = yaml.load(yamlTextData);
        setSwaggerSpec(JSON.stringify(parsed));
      } catch (e) {
        console.error('YAML parsing failed:', e);
      }

      setPrompt('');
      setActiveStep(2);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const steps = [
    'Generate Swagger Specs and User Stories',
    'Edit Swagger Specs and User Stories',
    'Generate Context JSON',
    'Edit Context JSON',
    'Generate Spring Boot Application'
  ];

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="pipeline-steps">
          {steps.map((step, index) => (
            <div
            key={index}
            className={`step-item ${activeStep === index + 1 ? 'active' : activeStep > index + 1 ? 'completed' : ''}`}
            data-step={index + 1}
          >          
              <div className="step-text">{step}</div>
            </div>
          ))}
        </div>
      </aside>
      <main className="chat-main">
        <header className="chat-header">AI Spring Boot Assistant</header>
        <div className="chat-thread">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.role}`}>{msg.content}</div>
          ))}

          {userStories && (
            <div className="chat-msg assistant">
              <h3>User Stories</h3>
              <textarea
                value={userStories}
                onChange={(e) => setUserStories(e.target.value)}
                className="editor-box"
                onBlur={() => setActiveStep(3)}
              />
            </div>
          )}

          {swaggerSpec && (
            <div className="chat-msg assistant">
              <h3>Swagger Preview</h3>
              <SwaggerUI spec={JSON.parse(swaggerSpec)} />
            </div>
          )}

          {yamlText && (
            <div className="chat-msg assistant">
              <h3>Swagger YAML Editor</h3>
              <CodeMirror
                value={yamlText}
                minHeight={`${Math.max(5, yamlText.split('\n').length * 24)}px`}
                maxHeight="600px"
                theme="dark"
                extensions={[yamlLang()]}
                onChange={(value) => setYamlText(value)}
                onBlur={() => setActiveStep(4)}
              />
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>
        <div className="chat-input-area" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          {promptError && <div style={{ color: '#f56565', fontSize: '0.9rem' }}>{promptError}</div>}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="chat-input"
            placeholder="Describe the service you need..."
          />
        </div>
        <div style={{ padding: '0 1rem 1rem 1rem', textAlign: 'right' }}>
          <button onClick={handleGenerate} disabled={loading} className="chat-send" style={{ width: '100%' }}>
            {loading ? 'Generating...' : 'Generate Swagger Specs and User Stories'}
          </button>
        </div>
        {zipUrl && <a className="chat-download" href={zipUrl} download="springboot_project.zip">Download Generated Project</a>}
      </main>
    </div>
  );
}

export default App;