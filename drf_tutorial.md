# Django REST Framework ML Integration Tutorial

## 📋 Overview
This tutorial shows you how to export ML models from Google Colab and integrate them into a Django REST Framework project.

---

## 🔧 Part 1: Export Models from Colab

### Step 1: Run in Your Colab Notebook

Add this code at the end of your existing Colab notebook (after training):

```python
import pickle
import json
from datetime import datetime

# Export trained models and encoders
print("\n📦 Exporting models...")

export_package = {
    'delay_model': ml.models['delay'],
    'penalty_model': ml.models['penalty'],
    'encoders': ml.encoders,
    'feature_cols': ml.feature_cols,
    'metadata': {
        'delay_accuracy': delay_acc,
        'trained_date': datetime.now().isoformat(),
        'model_version': '1.0'
    }
}

# Save models
with open('ml_models.pkl', 'wb') as f:
    pickle.dump(export_package, f)

# Save chatbot config
chatbot_config = {
    'model_name': 'all-MiniLM-L6-v2',
    'knowledge_base': chatbot.kb
}

with open('chatbot_config.json', 'w') as f:
    json.dump(chatbot_config, f, indent=2)

print("✅ Files created: ml_models.pkl, chatbot_config.json")
print("📥 Download these files from Colab")
```

### Step 2: Download Files
1. Run the export code in Colab
2. In Colab's file browser (left sidebar), find:
   - `ml_models.pkl`
   - `chatbot_config.json`
3. Right-click each file → Download

---

## 🏗️ Part 2: Setup Django Project

### Step 1: Create Project Structure

```bash
# Create Django project
django-admin startproject vendor_monitoring
cd vendor_monitoring

# Create API app
python manage.py startapp api

# Create ML models directory
mkdir ml_models
```

Your structure should look like:
```
vendor_monitoring/
├── manage.py
├── vendor_monitoring/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/
│   ├── __init__.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
└── ml_models/
    ├── ml_models.pkl          # Place downloaded file here
    └── chatbot_config.json    # Place downloaded file here
```

### Step 2: Install Dependencies

Create `requirements.txt`:
```txt
Django>=4.2.0
djangorestframework>=3.14.0
django-cors-headers>=4.3.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
xgboost>=2.0.0
sentence-transformers>=2.2.0
torch>=2.0.0
```

Install:
```bash
pip install -r requirements.txt
```

---

## ⚙️ Part 3: Configure Django

### Update `vendor_monitoring/settings.py`

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'corsheaders',
    
    # Your apps
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add CORS
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = True  # For development
# For production:
# CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "https://yourdomain.com"]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# ML Models Path
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ML_MODELS_PATH = os.path.join(BASE_DIR, 'ml_models', 'ml_models.pkl')
CHATBOT_CONFIG_PATH = os.path.join(BASE_DIR, 'ml_models', 'chatbot_config.json')
```

---

## 🤖 Part 4: Create ML Service

Create `api/ml_service.py`:

```python
import pickle
import numpy as np
from django.conf import settings

class MLService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.load_models()
    
    def load_models(self):
        with open(settings.ML_MODELS_PATH, 'rb') as f:
            package = pickle.load(f)
        
        self.delay_model = package['delay_model']
        self.penalty_model = package['penalty_model']
        self.encoders = package['encoders']
        self.feature_cols = package['feature_cols']
        self.metadata = package['metadata']
        
        print(f"✅ Models loaded (v{self.metadata['model_version']})")
    
    def predict_delay(self, project_data):
        # Encode features
        status_enc = self.encoders['delay']['status'].transform([project_data['status']])[0]
        priority_enc = self.encoders['delay']['priority'].transform([project_data['priority']])[0]
        risk_enc = self.encoders['delay']['risk'].transform([project_data['risk_score']])[0]
        
        X = np.array([[
            status_enc, priority_enc, risk_enc,
            project_data['days_since_start'],
            project_data['contract_value'],
            project_data['compliance_score']
        ]])
        
        prediction = self.delay_model.predict(X)[0]
        probability = self.delay_model.predict_proba(X)[0][1]
        
        return {
            'will_delay': bool(prediction),
            'delay_probability': float(probability),
            'risk_level': 'High' if probability > 0.7 else 'Medium' if probability > 0.4 else 'Low'
        }
    
    def predict_penalty(self, violation_type, delay_days):
        violation_enc = self.encoders['violation'].transform([violation_type])[0]
        X = np.array([[violation_enc, delay_days]])
        amount = self.penalty_model.predict(X)[0]
        
        return {
            'violation_type': violation_type,
            'delay_days': delay_days,
            'predicted_penalty': round(float(amount), 2)
        }

# Singleton instance
ml_service = MLService()
```

---

## 💬 Part 5: Create Chatbot Service

Create `api/chatbot_service.py`:

```python
import json
from sentence_transformers import SentenceTransformer, util
from django.conf import settings

class ChatbotService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChatbotService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.load_config()
    
    def load_config(self):
        with open(settings.CHATBOT_CONFIG_PATH, 'r') as f:
            config = json.load(f)
        
        self.model = SentenceTransformer(config['model_name'])
        self.kb = config['knowledge_base']
        self.kb_questions = list(self.kb.keys())
        self.kb_embeddings = self.model.encode(self.kb_questions, convert_to_tensor=True)
        
        print("✅ Chatbot loaded")
    
    def answer(self, question, context_data=None):
        # Semantic search
        q_embedding = self.model.encode(question, convert_to_tensor=True)
        scores = util.cos_sim(q_embedding, self.kb_embeddings)[0]
        best_idx = scores.argmax().item()
        
        if scores[best_idx] > 0.4:
            return self.kb[self.kb_questions[best_idx]]
        
        return "I can help with: system info, features, SLA, analytics"

# Singleton instance
chatbot_service = ChatbotService()
```

---

## 📝 Part 6: Create Serializers

Create `api/serializers.py`:

```python
from rest_framework import serializers

class DelayPredictionSerializer(serializers.Serializer):
    status = serializers.CharField()
    priority = serializers.CharField()
    risk_score = serializers.CharField()
    days_since_start = serializers.IntegerField()
    contract_value = serializers.FloatField()
    compliance_score = serializers.FloatField()

class PenaltyPredictionSerializer(serializers.Serializer):
    violation_type = serializers.CharField()
    delay_days = serializers.IntegerField()

class ChatRequestSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=500)
```

---

## 🔌 Part 7: Create API Views

Create `api/views.py`:

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from .ml_service import ml_service
from .chatbot_service import chatbot_service
from .serializers import (
    DelayPredictionSerializer,
    PenaltyPredictionSerializer,
    ChatRequestSerializer
)

@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@api_view(['POST'])
def predict_delay(request):
    serializer = DelayPredictionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        prediction = ml_service.predict_delay(serializer.validated_data)
        return Response(prediction)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def predict_penalty(request):
    serializer = PenaltyPredictionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        prediction = ml_service.predict_penalty(
            serializer.validated_data['violation_type'],
            serializer.validated_data['delay_days']
        )
        return Response(prediction)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def chat(request):
    serializer = ChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        answer = chatbot_service.answer(serializer.validated_data['question'])
        return Response({
            'question': serializer.validated_data['question'],
            'answer': answer
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

---

## 🛣️ Part 8: Configure URLs

Create `api/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check),
    path('predict/delay/', views.predict_delay),
    path('predict/penalty/', views.predict_penalty),
    path('chat/', views.chat),
]
```

Update `vendor_monitoring/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

---

## 🚀 Part 9: Run & Test

### Start Server

```bash
python manage.py migrate
python manage.py runserver
```

### Test Endpoints

**1. Health Check**
```bash
curl http://localhost:8000/api/health/
```

**2. Predict Delay**
```bash
curl -X POST http://localhost:8000/api/predict/delay/ \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "priority": "High",
    "risk_score": "Medium",
    "days_since_start": 45,
    "contract_value": 2500000,
    "compliance_score": 85.5
  }'
```

**3. Predict Penalty**
```bash
curl -X POST http://localhost:8000/api/predict/penalty/ \
  -H "Content-Type: application/json" \
  -d '{
    "violation_type": "Late Submission",
    "delay_days": 30
  }'
```

**4. Chat**
```bash
curl -X POST http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the system?"
  }'
```

---

## 🔗 Part 10: Frontend Integration

### JavaScript/React Example

```javascript
// Predict delay
async function predictDelay(projectData) {
  const response = await fetch('http://localhost:8000/api/predict/delay/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  return await response.json();
}

// Use it
const prediction = await predictDelay({
  status: "In Progress",
  priority: "High",
  risk_score: "Medium",
  days_since_start: 45,
  contract_value: 2500000,
  compliance_score: 85.5
});

console.log(prediction);
// { will_delay: false, delay_probability: 0.23, risk_level: "Low" }
```

---

## 📊 Part 11: Connect to Existing Database

If you have existing Django models for projects, vendors, etc., integrate like this:

Update `api/views.py`:

```python
from yourapp.models import Project, Vendor  # Your existing models

@api_view(['GET'])
def analyze_project(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
        vendor = project.vendor
        
        # Prepare data for ML
        project_data = {
            'status': project.status,
            'priority': project.priority,
            'risk_score': project.risk_score,
            'days_since_start': (datetime.now().date() - project.start_date).days,
            'contract_value': float(project.contract_value),
            'compliance_score': float(vendor.compliance_score)
        }
        
        # Get prediction
        prediction = ml_service.predict_delay(project_data)
        
        # Save to database if needed
        project.ai_risk_score = prediction['delay_probability']
        project.save()
        
        return Response({
            'project': project.project_code,
            'prediction': prediction
        })
        
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)
```

---

## 🔐 Part 12: Production Deployment

### Security Settings

```python
# settings.py
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']

CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### Use Gunicorn

```bash
pip install gunicorn
gunicorn vendor_monitoring.wsgi:application --bind 0.0.0.0:8000
```

---

## ✅ Checklist

- [ ] Export models from Colab
- [ ] Download ml_models.pkl and chatbot_config.json
- [ ] Create Django project structure
- [ ] Install dependencies
- [ ] Configure settings.py
- [ ] Create ml_service.py and chatbot_service.py
- [ ] Create serializers, views, and URLs
- [ ] Test all endpoints
- [ ] Integrate with existing models (optional)
- [ ] Deploy to production

---

## 🆘 Troubleshooting

**Models not loading?**
- Check file paths in settings.py
- Verify ml_models.pkl exists in ml_models/ folder
- Check console for error messages when server starts

**Import errors?**
- Ensure all dependencies installed: `pip install -r requirements.txt`
- Check Python version (3.8+)

**CORS errors?**
- Verify corsheaders in INSTALLED_APPS
- Check CorsMiddleware in MIDDLEWARE
- Confirm CORS_ALLOW_ALL_ORIGINS = True for development

**Prediction errors?**
- Ensure input data matches expected format
- Check that categorical values match training data
- Valid statuses: 'Planning', 'In Progress', 'QI Inspection', 'Billing', 'Completed'
- Valid priorities: 'Low', 'Medium', 'High', 'Critical'
- Valid risk_scores: 'Low', 'Medium', 'High'

---

## 📚 Next Steps

1. **Add authentication** - Use Django REST Framework's token authentication
2. **Add caching** - Cache predictions with Redis
3. **Add logging** - Track predictions and errors
4. **Create admin panel** - View predictions in Django admin
5. **Add batch predictions** - Process multiple projects at once
6. **Retrain models** - Set up pipeline to retrain with new data

**Need help?** Check Django REST Framework docs: https://www.django-rest-framework.org/