// File: backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.post('/generate', (req, res) => {
  res.json({
    user_stories: 'As a user, I want to onboard...',
    swagger: JSON.stringify({
      openapi: '3.0.0',
      info: { title: 'Customer Onboarding API', version: '1.0.0' },
      paths: {
        '/onboard': {
          post: {
            summary: 'Initiate customer onboarding',
            responses: {
              '200': { description: 'Successful onboarding' }
            }
          }
        }
      }
    })
  });
});

app.get('/swagger-yaml', (req, res) => {
    const sampleYAML = `
  openapi: 3.0.0
  info:
    title: Customer Onboarding API
    description: API to onboard a new customer into the banking system
    version: 1.0.0
  servers:
    - url: http://localhost:8000
  paths:
    /customers/onboard:
      post:
        summary: Onboard a new customer
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                properties:
                  fullName:
                    type: string
                  email:
                    type: string
                    format: email
                  phoneNumber:
                    type: string
                  address:
                    type: string
        responses:
          '200':
            description: Customer successfully onboarded
          '400':
            description: Invalid request payload
          '500':
            description: Internal server error
    `;
    res.type('text/yaml').send(sampleYAML);
  });
  

app.listen(port, () => {
  console.log("Server running at http://localhost:"+port);
});
