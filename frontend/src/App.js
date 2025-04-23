// File: frontend/src/App.js
import React, { useState, useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import './App.css';
import yaml from 'js-yaml';
import CodeMirror from '@uiw/react-codemirror';
import { yaml as yamlLang } from '@codemirror/lang-yaml';
import { json as jsonLang } from '@codemirror/lang-json';
import { FaCheckCircle, FaArrowDown } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [userStories, setUserStories] = useState('');
  const [swaggerSpec, setSwaggerSpec] = useState('');
  const [yamlText, setYamlText] = useState('');
  const [contextJson, setContextJson] = useState('');
  const [zipUrl, setZipUrl] = useState(null);
  const [promptError, setPromptError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const bottomRef = useRef(null);
  const [isEditingStories, setIsEditingStories] = useState(false);

  const markStepCompleted = (step) => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, step])));
  };

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

      setPrompt('');
      markStepCompleted(1);
      setActiveStep(2);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenerateSwaggerYaml = async () => {
    try {
      const yamlResponse = await fetch('http://localhost:8000/swagger-yaml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_stories: userStories })
      });
      const yamlTextData = await yamlResponse.text();
      setYamlText(yamlTextData);

      const parsed = yaml.load(yamlTextData);
      setSwaggerSpec(JSON.stringify(parsed));

      setPrompt('');
      markStepCompleted(2);
      setActiveStep(3);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleGenerateContextJson = async () => {
    try {
      const response = await fetch('http://localhost:8000/context-json');
      const data = await response.json();
      setContextJson(JSON.stringify(data, null, 2));
      markStepCompleted(3);
      setActiveStep(4);
    } catch (error) {
      console.error('Error generating context JSON:', error);
    }
  };

  const handleGenerateSpringBootApp = async () => {
    try {
      const response = await fetch('http://localhost:8000/download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setZipUrl(url);
      markStepCompleted(4);
      setActiveStep(5);

    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const handleDownloadComplete = () => {
    markStepCompleted(5);
    setActiveStep(6);

  };

  const samplePrompts = [
    'Create a customer onboarding service that interacts with a KYC provider and stores data in a customer registry.',
    'Design a payment processing microservice using BIAN standards and provide PSD2-compliant documentation.',
    'Generate a credit scoring API that integrates with external credit bureaus and returns scores.',
    'Build a transaction monitoring service for fraud detection with configurable rules engine.'
  ];

  const steps = [
    'Generate User Stories',
    'Generate Swagger Specs',
    'Generate Context JSON',
    'Generate Spring Boot Application',
    'Download Spring Boot Application'
  ];

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="sidebar-header">AI Spring Boot Assistant</div>
        <div className="pipeline-steps">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            return (
              <div
                key={index}
                className={`step-item ${activeStep === stepNumber ? 'active' : completedSteps.includes(stepNumber) ? 'completed' : ''}`}
                data-step={stepNumber}
              >
                <div className="step-text">{step}</div>
              </div>
            );
          })}
        </div>
      </aside>
      <main className="chat-main">
        <div className="chat-thread">
          {activeStep === 1 && (
            <div className="sample-prompts" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
              <h3>Try one of these prompts:</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                {samplePrompts.map((text, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#2d3748',
                      color: '#fff',
                      padding: '0.75rem 1rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                      maxWidth: '400px',
                      border: 'dashed'
                    }}
                    onClick={() => setPrompt(text)}
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.role}`}>{msg.content}</div>
          ))}

          {userStories && (
            <div className="chat-msg assistant">
              <h3>User Stories</h3>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setIsEditingStories(!isEditingStories)}
                  className="chat-send"
                  style={{ width: 'auto', fontSize: '0.8rem' }}
                >
                  {isEditingStories ? 'Preview' : 'Edit'}
                </button>
              </div>

              {isEditingStories ? (
                <textarea
                  value={userStories}
                  onChange={(e) => setUserStories(e.target.value)}
                  className="editor-box"
                  style={{ minHeight: '300px', fontFamily: 'monospace' }}
                  onBlur={() => setActiveStep(3)}
                />
              ) : (
                <div className="markdown-preview" style={{ backgroundColor: '#1a202c', padding: '1rem', borderRadius: '0.5rem' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{userStories}</ReactMarkdown>
                </div>
              )}
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
                minHeight={`${Math.max(5, yamlText.split('\n').length)}px`}
                maxHeight="600px"
                theme="dark"
                extensions={[yamlLang()]}
                onChange={(value) => setYamlText(value)}
              />
            </div>
          )}

          {contextJson && (
            <div className="chat-msg assistant">
              <h3>Context JSON Editor</h3>
              <CodeMirror
                value={contextJson}
                minHeight={`${Math.max(5, contextJson.split('\n').length * 24)}px`}
                maxHeight="600px"
                theme="dark"
                extensions={[jsonLang()]}
                onChange={(value) => setContextJson(value)}
              />
            </div>
          )}

          {activeStep === 6 && (
            <div className="chat-msg assistant" style={{ marginTop: '2rem', textAlign: 'center', animation: 'fadeIn 0.8s ease-in-out' }}>
              <FaCheckCircle size={64} color="#38a169" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#fff' }}>Spring Boot Application Generated Successfully</h3>
              <p style={{ color: '#cbd5e0' }}>Your application is ready to download.</p>
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        {activeStep === 1 && (
          <>
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
                {loading ? 'Generating...' : 'Generate User Stories'}
              </button>
            </div>
          </>
        )}

        {activeStep === 2 && (
          <div style={{ padding: '0 1rem 1rem 1rem', textAlign: 'right' }}>
            <button onClick={handleGenerateSwaggerYaml} disabled={loading} className="chat-send" style={{ width: '100%' }}>
              {loading ? 'Generating...' : 'Generate Swagger Specs'}
            </button>
          </div>
        )}
        {activeStep === 3 && (
          <div style={{ padding: '0 1rem 1rem 1rem', textAlign: 'right' }}>
            <button onClick={handleGenerateContextJson} disabled={loading} className="chat-send" style={{ width: '100%' }}>
              {loading ? 'Generating...' : 'Generate Context JSON'}
            </button>
          </div>
        )}

        {activeStep === 4 && (
          <div style={{ padding: '0 1rem 1rem 1rem', textAlign: 'right' }}>
            <button onClick={handleGenerateSpringBootApp} disabled={loading} className="chat-send" style={{ width: '100%' }}>
              {loading ? 'Generating...' : 'Generate Spring Boot Application'}
            </button>
          </div>
        )}

        {zipUrl && (
          <div style={{ padding: '0 1rem 1rem 1rem', textAlign: 'right' }}>
            <a
              className="chat-download"
              href={zipUrl}
              download="springboot_project.zip"
              onClick={handleDownloadComplete}
            >
              Download Generated Project
            </a>
          </div>
        )}
      </main>
      <div style={{ position: 'fixed', bottom: '180px', right: '20px', zIndex: 1000 }}>
        <button
          onClick={scrollToBottom}
          style={{
            backgroundColor: '#2d3748',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            padding: '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
          aria-label="Scroll to bottom"
        >
          <FaArrowDown size={20} />
        </button>
      </div>
    </div>
  );
}

export default App;