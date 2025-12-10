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