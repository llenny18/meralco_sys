

###  Testing API Endpoints
```bash
# Start server
python manage.py runserver
```

#### A. Login (All Users)
```bash
# POST /api/v1/auth/login/
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "vendor_rep",
    "password": "password123",
    "user_type": "Vendor Representative"
  }'

# Response:
{
  "success": true,
  "message": "Login successful",
  "token": "abc123...",
  "user": {
    "user_id": 1,
    "username": "vendor_rep",
    "role_name": "Vendor Representative",
    "permissions": [...]
  },
  "redirect_path": "/vendor/dashboard"
}
```

#### B. Vendor Representative Endpoints
```bash
# Get my projects
curl -X GET http://localhost:8000/api/v1/vendor-portal/my_projects/ \
  -H "Authorization: Token abc123..."

# Get pending documents
curl -X GET http://localhost:8000/api/v1/vendor-portal/pending_documents/ \
  -H "Authorization: Token abc123..."

# Upload document
curl -X POST http://localhost:8000/api/v1/vendor-portal/upload_document/ \
  -H "Authorization: Token abc123..." \
  -F "project_id=UUID" \
  -F "doc_type_id=UUID" \
  -F "document_name=COC.pdf" \
  -F "document_file=@/path/to/file.pdf"

# Get payment summary
curl -X GET http://localhost:8000/api/v1/vendor-portal/payment_summary/ \
  -H "Authorization: Token abc123..."

# Submit dispute
curl -X POST http://localhost:8000/api/v1/vendor-portal/submit_dispute/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "UUID",
    "dispute_subject": "Incorrect penalty",
    "dispute_description": "Details...",
    "dispute_type": "Penalty"
  }'
```

#### C. Clerk Endpoints
```bash
# Get pending documents
curl -X GET http://localhost:8000/api/v1/clerk/pending_documents/ \
  -H "Authorization: Token abc123..."

# Bulk upload documents
curl -X POST http://localhost:8000/api/v1/clerk/bulk_upload_documents/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "project_id": "UUID",
        "doc_type_id": "UUID",
        "document_name": "Permit.pdf",
        "document_path": "/uploads/permit.pdf"
      }
    ]
  }'

# Send reminder to vendor
curl -X POST http://localhost:8000/api/v1/clerk/send_reminder/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "UUID",
    "doc_type_id": "UUID",
    "message": "Please submit the required document."
  }'

# Get upload history
curl -X GET http://localhost:8000/api/v1/clerk/my_upload_history/?days=30 \
  -H "Authorization: Token abc123..."

# Generate missing documents report
curl -X GET http://localhost:8000/api/v1/clerk/missing_documents_report/ \
  -H "Authorization: Token abc123..."
```

#### D. Engineering Aide Endpoints
```bash
# Get workflow overview
curl -X GET http://localhost:8000/api/v1/engineering-aide/workflow_overview/ \
  -H "Authorization: Token abc123..."

# Get workflow visualization for specific project
curl -X GET http://localhost:8000/api/v1/engineering-aide/workflow_visualization/?project_id=UUID \
  -H "Authorization: Token abc123..."

# Get document compliance summary
curl -X GET http://localhost:8000/api/v1/engineering-aide/document_compliance_summary/ \
  -H "Authorization: Token abc123..."

# Send workflow notification
curl -X POST http://localhost:8000/api/v1/engineering-aide/send_workflow_notification/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": 1,
    "message": "Please complete this stage by tomorrow."
  }'

# Get upcoming deadlines
curl -X GET http://localhost:8000/api/v1/engineering-aide/upcoming_deadlines/?days=7 \
  -H "Authorization: Token abc123..."

# Generate summary report
curl -X GET http://localhost:8000/api/v1/engineering-aide/summary_report/?type=weekly \
  -H "Authorization: Token abc123..."
```

#### E. Quality Inspector Endpoints
```bash
# Get today's schedule
curl -X GET http://localhost:8000/api/v1/qi-mobile/today_schedule/ \
  -H "Authorization: Token abc123..."

# Complete inspection
curl -X POST http://localhost:8000/api/v1/qi-mobile/complete_inspection/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "inspection_id": 1,
    "result": "Pass",
    "findings": "All requirements met.",
    "coordinates": "14.5995,120.9842"
  }'

# Get daily progress
curl -X GET http://localhost:8000/api/v1/qi-mobile/daily_progress/ \
  -H "Authorization: Token abc123..."

# Log missed target reason
curl -X POST http://localhost:8000/api/v1/qi-mobile/log_missed_target/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Weather conditions prevented access to site.",
    "category": "External Factors"
  }'
```

#### F. Engineer Endpoints
```bash
# Get my projects
curl -X GET http://localhost:8000/api/v1/engineer/my_projects/ \
  -H "Authorization: Token abc123..."

# Get pending approvals
curl -X GET http://localhost:8000/api/v1/engineer/pending_approvals/ \
  -H "Authorization: Token abc123..."

# Approve document
curl -X POST http://localhost:8000/api/v1/engineer/approve_document/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": 1,
    "comments": "Approved - all requirements met."
  }'

# Reject document
curl -X POST http://localhost:8000/api/v1/engineer/reject_document/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": 1,
    "reason": "Missing required signatures."
  }'

# Get SLA compliance
curl -X GET http://localhost:8000/api/v1/engineer/sla_compliance/ \
  -H "Authorization: Token abc123..."

# Get vendor performance
curl -X GET http://localhost:8000/api/v1/engineer/vendor_performance/ \
  -H "Authorization: Token abc123..."

# Use AI chatbot
curl -X POST http://localhost:8000/api/v1/engineer/use_chatbot/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What were the most common delay factors last quarter?"
  }'
```

#### G. WO Supervisor Endpoints
```bash
# Get full dashboard
curl -X GET http://localhost:8000/api/v1/wo-supervisor/full_dashboard/ \
  -H "Authorization: Token abc123..."

# Manage penalties
curl -X GET http://localhost:8000/api/v1/wo-supervisor/manage_penalties/?status=Draft \
  -H "Authorization: Token abc123..."

# Create escalation
curl -X POST http://localhost:8000/api/v1/wo-supervisor/manage_escalation/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "project_id": "UUID",
    "escalation_rule_id": 1,
    "reason": "Critical delay requires immediate attention.",
    "escalate_to_user_id": 5
  }'

# Get predictive analytics
curl -X GET http://localhost:8000/api/v1/wo-supervisor/predictive_analytics/ \
  -H "Authorization: Token abc123..."
```

#### H. Team Leader Endpoints
```bash
# Get organization overview (TV Mode)
curl -X GET http://localhost:8000/api/v1/team-leader/organization_overview/ \
  -H "Authorization: Token abc123..."

# Get pending approvals
curl -X GET http://localhost:8000/api/v1/team-leader/pending_approvals/ \
  -H "Authorization: Token abc123..."

# Approve penalty
curl -X POST http://localhost:8000/api/v1/team-leader/approve_penalty/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "penalty_id": 1,
    "action": "approve"
  }'

# Get performance trends
curl -X GET http://localhost:8000/api/v1/team-leader/performance_trends/?months=12 \
  -H "Authorization: Token abc123..."

# Get comparison report
curl -X GET http://localhost:8000/api/v1/team-leader/comparison_report/ \
  -H "Authorization: Token abc123..."

# Get AI suggestions
curl -X GET http://localhost:8000/api/v1/team-leader/ai_suggestions/ \
  -H "Authorization: Token abc123..."

# Manage user access
curl -X POST http://localhost:8000/api/v1/team-leader/manage_user_access/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "deactivate",
    "user_id": 10
  }'
```

#### I. Sector Manager Endpoints
```bash
# Get executive dashboard
curl -X GET http://localhost:8000/api/v1/sector-manager/executive_dashboard/ \
  -H "Authorization: Token abc123..."

# Get sector trends
curl -X GET http://localhost:8000/api/v1/sector-manager/sector_trends/?sector_id=1&months=12 \
  -H "Authorization: Token abc123..."

# Get vendor rankings
curl -X GET http://localhost:8000/api/v1/sector-manager/vendor_rankings/?sector_id=1 \
  -H "Authorization: Token abc123..."

# Get strategic recommendations
curl -X GET http://localhost:8000/api/v1/sector-manager/strategic_recommendations/ \
  -H "Authorization: Token abc123..."
```

#### J. System Administrator Endpoints
```bash
# Get system health
curl -X GET http://localhost:8000/api/v1/system-admin/system_health/ \
  -H "Authorization: Token abc123..."

# Get user management overview
curl -X GET http://localhost:8000/api/v1/system-admin/user_management/ \
  -H "Authorization: Token abc123..."

# Create new user
curl -X POST http://localhost:8000/api/v1/system-admin/create_user/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "first_name": "New",
    "last_name": "User",
    "password": "SecurePass123",
    "confirm_password": "SecurePass123",
    "role_name": "Engineer"
  }'

# Manage user
curl -X POST http://localhost:8000/api/v1/system-admin/manage_user/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reset_password",
    "user_id": 10,
    "new_password": "NewPass123"
  }'

# Get audit logs
curl -X GET http://localhost:8000/api/v1/system-admin/audit_logs/?days=7 \
  -H "Authorization: Token abc123..."

# Update system setting
curl -X POST http://localhost:8000/api/v1/system-admin/update_setting/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "setting_key": "max_file_size_mb",
    "setting_value": "50"
  }'

# Get security report
curl -X GET http://localhost:8000/api/v1/system-admin/security_report/?days=7 \
  -H "Authorization: Token abc123..."

# Trigger database backup
curl -X POST http://localhost:8000/api/v1/system-admin/database_backup/ \
  -H "Authorization: Token abc123..."
```

### Part 3: Integration Examples

#### Python Integration
```python
import requests

class VendorAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Token {token}',
            'Content-Type': 'application/json'
        }
    
    def get_my_projects(self):
        response = requests.get(
            f'{self.base_url}/api/v1/vendor-portal/my_projects/',
            headers=self.headers
        )
        return response.json()
    
    def upload_document(self, project_id, doc_type_id, file_path):
        with open(file_path, 'rb') as f:
            files = {'document_file': f}
            data = {
                'project_id': project_id,
                'doc_type_id': doc_type_id,
                'document_name': file_path.split('/')[-1]
            }
            response = requests.post(
                f'{self.base_url}/api/v1/vendor-portal/upload_document/',
                headers={'Authorization': self.headers['Authorization']},
                data=data,
                files=files
            )
        return response.json()

# Usage
api = VendorAPI('http://localhost:8000', 'your_token_here')
projects = api.get_my_projects()
print(projects)
```

#### JavaScript Integration
```javascript
class ClerkAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async getPendingDocuments() {
    const response = await fetch(
      `${this.baseURL}/api/v1/clerk/pending_documents/`,
      {
        headers: {
          'Authorization': `Token ${this.token}`
        }
      }
    );
    return await response.json();
  }

  async sendReminder(projectId, docTypeId, message) {
    const response = await fetch(
      `${this.baseURL}/api/v1/clerk/send_reminder/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: projectId,
          doc_type_id: docTypeId,
          message: message
        })
      }
    );
    return await response.json();
  }
}

// Usage
const api = new ClerkAPI('http://localhost:8000', 'your_token_here');
const pending = await api.getPendingDocuments();
console.log(pending);
```

### Part 4: Frontend React Example
```javascript
// QI Mobile App Component
import React, { useState, useEffect } from 'react';

function QIMobileApp({ token }) {
  const [schedule, setSchedule] = useState([]);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetchTodaySchedule();
    fetchDailyProgress();
  }, []);

  const fetchTodaySchedule = async () => {
    const response = await fetch(
      'http://localhost:8000/api/v1/qi-mobile/today_schedule/',
      {
        headers: { 'Authorization': `Token ${token}` }
      }
    );
    const data = await response.json();
    setSchedule(data);
  };

  const fetchDailyProgress = async () => {
    const response = await fetch(
      'http://localhost:8000/api/v1/qi-mobile/daily_progress/',
      {
        headers: { 'Authorization': `Token ${token}` }
      }
    );
    const data = await response.json();
    setProgress(data);
  };

  const completeInspection = async (inspectionId, result, findings) => {
    await fetch(
      'http://localhost:8000/api/v1/qi-mobile/complete_inspection/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inspection_id: inspectionId,
          result: result,
          findings: findings,
          coordinates: `${position.coords.latitude},${position.coords.longitude}`
        })
      }
    );
    fetchTodaySchedule();
    fetchDailyProgress();
  };

  return (
    <div className="qi-mobile-app">
      <h1>QI Daily Schedule</h1>
      
      {progress && (
        <div className="progress-card">
          <h2>Today's Progress</h2>
          <p>Target: {progress.target}</p>
          <p>Completed: {progress.actual}</p>
          <p>Remaining: {progress.remaining}</p>
          <div className="progress-bar">
            <div style={{ width: `${progress.percentage}%` }} />
          </div>
        </div>
      )}

      <div className="inspection-list">
        {schedule.map(inspection => (
          <InspectionCard
            key={inspection.id}
            inspection={inspection}
            onComplete={completeInspection}
          />
        ))}
      </div>
    </div>
  );
}
```

This completes the comprehensive user-level features implementation with full DRF tutorial! Each role now has dedicated endpoints with proper permissions and functionality.