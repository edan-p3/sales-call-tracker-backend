# Data Migration Guide

Guide for migrating data from localStorage to the backend API.

## Overview

This guide helps users migrate their existing sales activity data from localStorage (browser-based) to the new backend database.

## Understanding the Data

### Current localStorage Structure

```javascript
// Goals are stored as:
localStorage.setItem('goals', JSON.stringify({
  callsPerDay: 25,
  emailsPerDay: 30,
  // ... etc
}));

// Week data is stored as:
localStorage.setItem('week-2026-01-06-John', JSON.stringify({
  monday: { calls: 30, emails: 35, ... },
  tuesday: { ... },
  // ... etc
}));
```

## Migration Strategy

### Option 1: Manual Migration

Best for users with limited data (< 10 weeks).

#### Step 1: Export localStorage Data

Add this function to browser console:

```javascript
function exportLocalStorageData() {
  const data = {
    goals: null,
    weeks: []
  };

  // Export goals
  const goals = localStorage.getItem('goals');
  if (goals) {
    data.goals = JSON.parse(goals);
  }

  // Export all week data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('week-')) {
      const value = localStorage.getItem(key);
      data.weeks.push({
        key: key,
        data: JSON.parse(value)
      });
    }
  }

  console.log(JSON.stringify(data, null, 2));
  return data;
}

// Run export
const myData = exportLocalStorageData();
```

#### Step 2: Register/Login to Backend

1. Open your frontend application
2. Register a new account or login
3. Save your authentication token

#### Step 3: Import Data

Use this script in browser console after logging in:

```javascript
async function importDataToBackend(data, apiUrl, token) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    // Import goals
    if (data.goals) {
      await fetch(`${apiUrl}/goals`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data.goals)
      });
      console.log('✅ Goals imported');
    }

    // Import weeks
    for (const week of data.weeks) {
      // Extract weekStartDate from key (format: week-YYYY-MM-DD-RepName)
      const weekStartDate = week.key.split('-').slice(1, 4).join('-');
      
      await fetch(`${apiUrl}/activity/week`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          weekStartDate: weekStartDate,
          ...week.data
        })
      });
      console.log(`✅ Week ${weekStartDate} imported`);
    }

    console.log('🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

// Run import
const API_URL = 'http://localhost:5000/api'; // or your production URL
const TOKEN = localStorage.getItem('authToken');
importDataToBackend(myData, API_URL, TOKEN);
```

### Option 2: Automated Migration

Create a migration component in your React app.

#### Create Migration Component

Create `src/components/DataMigration.js`:

```javascript
import React, { useState } from 'react';
import api from '../utils/api';

const DataMigration = ({ onComplete }) => {
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const extractLocalStorageData = () => {
    const data = {
      goals: null,
      weeks: []
    };

    // Get goals
    const goalsStr = localStorage.getItem('goals');
    if (goalsStr) {
      try {
        data.goals = JSON.parse(goalsStr);
      } catch (e) {
        console.error('Error parsing goals:', e);
      }
    }

    // Get all week data
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('week-')) {
        try {
          const value = localStorage.getItem(key);
          const weekData = JSON.parse(value);
          
          // Extract date from key (week-YYYY-MM-DD-RepName)
          const parts = key.split('-');
          if (parts.length >= 4) {
            const weekStartDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
            data.weeks.push({
              weekStartDate,
              data: weekData
            });
          }
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    }

    return data;
  };

  const migrateData = async () => {
    try {
      setStatus('Scanning localStorage...');
      setError('');
      
      const localData = extractLocalStorageData();
      
      if (!localData.goals && localData.weeks.length === 0) {
        setStatus('No data found to migrate');
        return;
      }

      const totalSteps = (localData.goals ? 1 : 0) + localData.weeks.length;
      let completed = 0;

      // Migrate goals
      if (localData.goals) {
        setStatus('Migrating goals...');
        await api.put('/goals', localData.goals);
        completed++;
        setProgress((completed / totalSteps) * 100);
      }

      // Migrate weeks
      for (const week of localData.weeks) {
        setStatus(`Migrating week ${week.weekStartDate}...`);
        
        await api.post('/activity/week', {
          weekStartDate: week.weekStartDate,
          ...week.data
        });
        
        completed++;
        setProgress((completed / totalSteps) * 100);
      }

      setStatus('✅ Migration complete!');
      setProgress(100);
      
      // Optionally clear localStorage
      if (window.confirm('Migration successful! Clear localStorage?')) {
        clearLocalStorageData();
      }
      
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error?.message || 'Migration failed');
      console.error('Migration error:', err);
    }
  };

  const clearLocalStorageData = () => {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('week-') || key === 'goals') {
        localStorage.removeItem(key);
      }
    }
    setStatus('✅ localStorage cleared');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Data Migration</h2>
      
      <p className="text-gray-700 mb-4">
        Migrate your existing sales activity data from browser storage to the cloud.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {status && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{status}</p>
          {progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <button
        onClick={migrateData}
        disabled={progress > 0 && progress < 100}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {progress > 0 && progress < 100 ? 'Migrating...' : 'Start Migration'}
      </button>

      <button
        onClick={() => onComplete && onComplete()}
        className="w-full mt-2 text-gray-600 hover:text-gray-800"
      >
        Skip Migration
      </button>
    </div>
  );
};

export default DataMigration;
```

#### Add to App Flow

```javascript
// In your App.js or Dashboard
import DataMigration from './components/DataMigration';

function App() {
  const [showMigration, setShowMigration] = useState(false);

  useEffect(() => {
    // Check if user has old data
    const hasOldData = localStorage.getItem('goals') || 
                       Object.keys(localStorage).some(k => k.startsWith('week-'));
    
    if (hasOldData) {
      setShowMigration(true);
    }
  }, []);

  if (showMigration) {
    return <DataMigration onComplete={() => setShowMigration(false)} />;
  }

  return (
    // Your normal app
  );
}
```

### Option 3: Backend Migration Endpoint (Optional)

If you want to create a dedicated migration endpoint:

#### Add Migration Controller

Create `src/controllers/migrationController.js`:

```javascript
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { isMonday, isValidDateFormat } = require('../utils/dateHelpers');

const migrateData = async (req, res, next) => {
  try {
    const { goals, weeks } = req.body;

    // Migrate goals
    if (goals) {
      await prisma.goals.upsert({
        where: {
          userId: req.user.id,
        },
        update: goals,
        create: {
          userId: req.user.id,
          ...goals,
        },
      });
    }

    // Migrate weeks
    let migratedCount = 0;
    for (const week of weeks || []) {
      const { weekStartDate, ...data } = week;

      if (!isValidDateFormat(weekStartDate) || !isMonday(weekStartDate)) {
        continue; // Skip invalid dates
      }

      await prisma.weeklyActivity.upsert({
        where: {
          userId_weekStartDate: {
            userId: req.user.id,
            weekStartDate,
          },
        },
        update: data,
        create: {
          userId: req.user.id,
          weekStartDate,
          ...data,
        },
      });

      migratedCount++;
    }

    return successResponse(res, {
      goalsImported: !!goals,
      weeksImported: migratedCount,
    }, 'Data migrated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { migrateData };
```

#### Add Migration Route

In `src/routes/auth.js`:

```javascript
const { migrateData } = require('../controllers/migrationController');

router.post('/migrate-data', authenticateToken, migrateData);
```

## Verification

After migration, verify your data:

### 1. Check Goals

```javascript
// In browser console
fetch('http://localhost:5000/api/goals', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(r => r.json())
.then(console.log);
```

### 2. Check Activities

```javascript
// In browser console
fetch('http://localhost:5000/api/activity/all', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(r => r.json())
.then(console.log);
```

## Cleanup

After successful migration:

### 1. Clear Old Data

```javascript
function clearOldLocalStorage() {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith('week-') || key === 'goals') {
      localStorage.removeItem(key);
    }
  }
  console.log('✅ Old data cleared');
}

clearOldLocalStorage();
```

### 2. Keep Authentication Data

Do NOT clear:
- `authToken`
- `user`

## Common Issues

### Issue: Week dates are not Mondays

**Solution:** Adjust dates to nearest Monday:

```javascript
function adjustToMonday(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}
```

### Issue: Data format mismatch

**Solution:** Transform data before sending:

```javascript
function transformWeekData(oldFormat) {
  return {
    monday: oldFormat.monday || { calls: 0, emails: 0, contacts: 0, responses: 0 },
    tuesday: oldFormat.tuesday || { calls: 0, emails: 0, contacts: 0, responses: 0 },
    // ... etc
  };
}
```

### Issue: Token expired during migration

**Solution:** Refresh token or re-login:

```javascript
// Check if still authenticated
const token = localStorage.getItem('authToken');
if (!token) {
  alert('Please login again');
  window.location.href = '/login';
}
```

## Best Practices

1. **Backup first**: Export localStorage data before migrating
2. **Test with one week**: Verify migration works before full migration
3. **Check data**: Verify all data migrated correctly
4. **Keep backup**: Don't clear localStorage until verified
5. **Document**: Keep track of what was migrated

## Support

If migration fails:
1. Check browser console for errors
2. Verify authentication token is valid
3. Check date formats (must be YYYY-MM-DD)
4. Ensure week start dates are Mondays
5. Contact support with error messages

---

**Migration complete! Your data is now safely stored in the cloud. 🎉**

