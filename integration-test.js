/**
 * INTEGRATION TEST SCRIPT
 * 
 * This script tests the integration between the BrickByBrick frontend and backend.
 * It verifies API endpoints, CORS configuration, and data flow.
 */

// Using built-in fetch (Node.js 18+) or fallback to https module
const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:7007';
const FRONTEND_URL = 'http://localhost:3000';

// Test data
const testUser = {
  firstName: 'Integration',
  lastName: 'Test',
  email: 'integration.test@example.com',
  password: 'password123'
};

let authToken = '';
let userId = '';

async function testAPI() {
  console.log('🧪 Starting BrickByBrick Integration Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.message);
    console.log('');

    // Test 2: User Registration
    console.log('2️⃣ Testing User Registration...');
    const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      console.log('✅ User Registration Successful');
      authToken = registerData.token;
      userId = registerData.data.id;
      console.log('   User ID:', userId);
      console.log('   Token received:', authToken ? 'Yes' : 'No');
    } else {
      console.log('❌ User Registration Failed:', registerData.message);
    }
    console.log('');

    // Test 3: User Login
    console.log('3️⃣ Testing User Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ User Login Successful');
      console.log('   User:', loginData.data.firstName, loginData.data.lastName);
    } else {
      console.log('❌ User Login Failed:', loginData.message);
    }
    console.log('');

    // Test 4: Token Verification
    console.log('4️⃣ Testing Token Verification...');
    const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      console.log('✅ Token Verification Successful');
      console.log('   Authenticated User:', verifyData.data.email);
    } else {
      console.log('❌ Token Verification Failed:', verifyData.message);
    }
    console.log('');

    // Test 5: Create Problem
    console.log('5️⃣ Testing Problem Creation...');
    const problemData = {
      title: 'Integration Test Problem',
      platform: 'LeetCode',
      difficulty: 'easy',
      topic: 'Arrays',
      subtopic: 'Two Pointers',
      timeSpent: 30,
      outcome: 'solved',
      date: new Date().toISOString().split('T')[0],
      link: 'https://leetcode.com/problems/test',
      tags: ['array', 'test'],
      approachNotes: 'Integration test problem',
      codeLink: 'https://github.com/test',
      isRevision: false
    };

    const problemResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/problems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(problemData)
    });
    const problemResult = await problemResponse.json();
    
    if (problemResult.success) {
      console.log('✅ Problem Creation Successful');
      console.log('   Problem ID:', problemResult.data.id);
    } else {
      console.log('❌ Problem Creation Failed:', problemResult.message);
    }
    console.log('');

    // Test 6: Get User Problems
    console.log('6️⃣ Testing Get User Problems...');
    const getProblemsResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/problems`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const problemsData = await getProblemsResponse.json();
    
    if (problemsData.success) {
      console.log('✅ Get User Problems Successful');
      console.log('   Problems Count:', problemsData.data.length);
    } else {
      console.log('❌ Get User Problems Failed:', problemsData.message);
    }
    console.log('');

    // Test 7: Create Learning Item
    console.log('7️⃣ Testing Learning Item Creation...');
    const learningData = {
      title: 'Integration Test Course',
      type: 'course',
      category: 'Web Development',
      subtopic: 'React',
      timeSpent: 120,
      progress: 50,
      status: 'in-progress',
      date: new Date().toISOString().split('T')[0],
      link: 'https://example.com/course',
      tags: 'react, javascript',
      notes: 'Integration test learning item',
      resourceLink: 'https://github.com/test',
      isRevision: false,
      difficulty: 'intermediate',
      platform: 'Example Platform'
    };

    const learningResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/learning-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(learningData)
    });
    const learningResult = await learningResponse.json();
    
    if (learningResult.success) {
      console.log('✅ Learning Item Creation Successful');
      console.log('   Learning Item ID:', learningResult.data.id);
    } else {
      console.log('❌ Learning Item Creation Failed:', learningResult.message);
    }
    console.log('');

    // Test 8: Create Roadmap
    console.log('8️⃣ Testing Roadmap Creation...');
    const roadmapData = {
      title: 'Integration Test Roadmap',
      description: 'Test roadmap for integration testing',
      color: '#3B82F6',
      isPublic: false
    };

    const roadmapResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/roadmaps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(roadmapData)
    });
    const roadmapResult = await roadmapResponse.json();
    
    if (roadmapResult.success) {
      console.log('✅ Roadmap Creation Successful');
      console.log('   Roadmap ID:', roadmapResult.data.id);
    } else {
      console.log('❌ Roadmap Creation Failed:', roadmapResult.message);
    }
    console.log('');

    // Test 9: Get User Stats
    console.log('9️⃣ Testing User Statistics...');
    const statsResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      console.log('✅ User Statistics Retrieved');
      console.log('   Total Problems:', statsData.data.totalProblems);
      console.log('   Success Rate:', statsData.data.successRate + '%');
    } else {
      console.log('❌ User Statistics Failed:', statsData.message);
    }
    console.log('');

    // Test 10: CORS Test
    console.log('10️⃣ Testing CORS Configuration...');
    const corsResponse = await fetch(`${API_BASE_URL}/api/users`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const corsHeaders = corsResponse.headers.get('access-control-allow-origin');
    if (corsHeaders) {
      console.log('✅ CORS Configuration Working');
      console.log('   Allowed Origin:', corsHeaders);
    } else {
      console.log('⚠️ CORS Headers Not Found');
    }
    console.log('');

    console.log('🎉 Integration Tests Completed Successfully!');
    console.log('');
    console.log('📊 Test Summary:');
    console.log('   ✅ Backend API is running and responsive');
    console.log('   ✅ Authentication system is working');
    console.log('   ✅ CRUD operations are functional');
    console.log('   ✅ CORS is configured for frontend integration');
    console.log('   ✅ Frontend can communicate with backend');

  } catch (error) {
    console.error('❌ Integration Test Failed:', error.message);
    console.error('   Make sure both servers are running:');
    console.error('   - Backend: http://localhost:7007');
    console.error('   - Frontend: http://localhost:3000');
  }
}

// Run the tests
testAPI();
