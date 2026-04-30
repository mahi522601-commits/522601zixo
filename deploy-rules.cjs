const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');

async function deployRules() {
  const auth = new GoogleAuth({
    keyFile: './service-account.json',
    scopes: ['https://www.googleapis.com/auth/firebase', 'https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const projectId = 'global-baton-454508-e9';
  
  const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read, write: if true;
    }
    match /categories/{categoryId} {
      allow read, write: if true;
    }
    match /orders/{orderId} {
      allow read, write: if true;
    }
  }
}`;

  console.log("Creating ruleset...");
  const rulesetRes = await client.request({
    url: `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    method: 'POST',
    data: {
      source: {
        files: [{ name: 'firestore.rules', content: rules }]
      }
    }
  });

  const rulesetName = rulesetRes.data.name;
  console.log('Created ruleset:', rulesetName);

  console.log("Releasing ruleset...");
  // Release it for the specific database or default
  // But wait, what if the database is not default?
  // Usually the release name for default is cloud.firestore
  // For named database: cloud.firestore/databases/DATABASE_ID
  const releaseName = `projects/${projectId}/releases/cloud.firestore`;
  const dbReleaseName = `projects/${projectId}/releases/cloud.firestore/databases/ai-studio-ebdd5a64-0a16-4954-be8c-990515302f14`;
  
  try {
    const releaseRes = await client.request({
      url: `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`,
      method: 'POST',
      data: {
        name: dbReleaseName,
        rulesetName: rulesetName
      }
    });
    console.log('Released to named DB (Created):', releaseRes.data);
  } catch(e) {
    console.log("POST failed, trying PATCH...", e.message);
    try {
      const patchRes = await client.request({
        url: `https://firebaserules.googleapis.com/v1/${dbReleaseName}`,
        method: 'PATCH',
        data: {
          release: {
            name: dbReleaseName,
            rulesetName: rulesetName
          }
        }
      });
      console.log('Released to named DB (Patched):', patchRes.data);
    } catch(err) {
      console.error("PATCH failed too:", err.response ? JSON.stringify(err.response.data) : err.message);
    }
  }
}

deployRules().catch(console.error);
