import os
import pickle
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

model_dir = os.path.join(os.path.dirname(__file__), 'models')

# Load the artifacts
with open(os.path.join(model_dir, 'feature_names (1).pkl'), 'rb') as f:
    feature_names = pickle.load(f)

# The model could be in best_model or risk_engine
try:
    with open(os.path.join(model_dir, 'best_model (1).pkl'), 'rb') as f:
        model = pickle.load(f)
except:
    with open(os.path.join(model_dir, 'risk_engine.pkl'), 'rb') as f:
        model = pickle.load(f)

with open(os.path.join(model_dir, 'scaler (1).pkl'), 'rb') as f:
    scaler = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Create a dictionary for the features with defaults
        # We use a median/mode approach or just some sensible defaults for missing fields
        features = {
            'Age': data.get('Age', 35),
            'DailyRate': 800,
            'DistanceFromHome': 10,
            'Education': 3,
            'EnvironmentSatisfaction': 3,
            'HourlyRate': 65,
            'JobInvolvement': 3,
            'JobLevel': 2,
            'JobSatisfaction': 3,
            'MonthlyIncome': data.get('MonthlyIncome', 5000),
            'MonthlyRate': 15000,
            'NumCompaniesWorked': 2,
            'PercentSalaryHike': 14,
            'PerformanceRating': data.get('PerformanceRating', 3.0),
            'RelationshipSatisfaction': 3,
            'StockOptionLevel': 1,
            'TotalWorkingYears': data.get('YearsAtCompany', 5) + 3,
            'TrainingTimesLastYear': 2,
            'WorkLifeBalance': 3,
            'YearsAtCompany': data.get('YearsAtCompany', 5),
            'YearsInCurrentRole': max(0, data.get('YearsAtCompany', 5) - 1),
            'YearsSinceLastPromotion': 1,
            'YearsWithCurrManager': max(0, data.get('YearsAtCompany', 5) - 1),
            'CompanyExperienceRatio': 0.5,
            'PromotionGap': 1,
            'IncomePerLevel': data.get('MonthlyIncome', 5000) / 2.0,
            'ManagerStability': 2,
            'FrequentTraveller': 0,
            'LongDistance': 0,
            'HighIncome': 1 if data.get('MonthlyIncome', 5000) > 7000 else 0,
            'SeniorEmployee': 0,
            'BusinessTravel_Travel_Frequently': 0,
            'BusinessTravel_Travel_Rarely': 1,
            'Department_Research & Development': 1 if data.get('Department', '') == 'R&D' else 0,
            'Department_Sales': 1 if data.get('Department', '') == 'Sales' else 0,
            'EducationField_Life Sciences': 1,
            'EducationField_Marketing': 0,
            'EducationField_Medical': 0,
            'EducationField_Other': 0,
            'EducationField_Technical Degree': 0,
            'Gender_Male': 1,
            'JobRole_Human Resources': 0,
            'JobRole_Laboratory Technician': 0,
            'JobRole_Manager': 0,
            'JobRole_Manufacturing Director': 0,
            'JobRole_Research Director': 0,
            'JobRole_Research Scientist': 1,
            'JobRole_Sales Executive': 0,
            'JobRole_Sales Representative': 0,
            'MaritalStatus_Married': 1,
            'MaritalStatus_Single': 0,
            'OverTime_Yes': 0
        }
        
        # Convert to DataFrame in the exact order of feature_names
        df = pd.DataFrame([features])
        df = df[feature_names]
        
        # Scale the features
        X_scaled = scaler.transform(df)
        
        # Predict probability
        if hasattr(model, 'predict_proba'):
            prob = model.predict_proba(X_scaled)[0][1] # Probability of positive class (churn)
        else:
            # Fallback if model only outputs predictions
            prob = float(model.predict(X_scaled)[0])
            
        # Determine risk level
        risk_level = "Low"
        if prob >= 0.70:
            risk_level = "High"
        elif prob >= 0.40:
            risk_level = "Medium"
            
        return jsonify({
            'riskScore': float(prob),
            'riskLevel': risk_level
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
