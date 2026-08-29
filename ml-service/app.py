import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

model_dir = os.path.join(os.path.dirname(__file__), 'models')

# Load the artifacts using joblib
feature_names = joblib.load(os.path.join(model_dir, 'feature_names (1).pkl'))

# The model could be in best_model or risk_engine
try:
    model = joblib.load(os.path.join(model_dir, 'best_model (1).pkl'))
except:
    model = joblib.load(os.path.join(model_dir, 'risk_engine.pkl'))

scaler = joblib.load(os.path.join(model_dir, 'scaler (1).pkl'))

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Income correlates
        monthly_income = data.get('MonthlyIncome', 5000)
        daily_rate = max(100, min(1500, monthly_income / 22 * 3.5))
        hourly_rate = max(30, min(100, daily_rate / 8))
        monthly_rate = max(2000, min(26000, monthly_income * 3))
        job_level = max(1, min(5, int(monthly_income / 3500) + 1))
        
        # Tenure correlates
        years_at_company = data.get('YearsAtCompany', 5)
        promotion_gap = data.get('PromotionGap', max(0, years_at_company // 3))
        
        # Performance correlates
        perf_rating = data.get('PerformanceRating', 3.0)
        base_sat = max(1, min(4, int(perf_rating)))
        if perf_rating < 2.5:
            percent_hike = 0
            involvement = max(1, base_sat - 1)
        else:
            percent_hike = int(11 + (perf_rating - 3) * 5)
            involvement = base_sat

        features = {
            'Age': data.get('Age', 35),
            'DailyRate': daily_rate,
            'DistanceFromHome': 10,
            'Education': 3,
            'EnvironmentSatisfaction': base_sat,
            'HourlyRate': hourly_rate,
            'JobInvolvement': involvement,
            'JobLevel': job_level,
            'JobSatisfaction': base_sat,
            'MonthlyIncome': monthly_income,
            'MonthlyRate': monthly_rate,
            'NumCompaniesWorked': 2,
            'PercentSalaryHike': max(0, percent_hike),
            'PerformanceRating': perf_rating,
            'RelationshipSatisfaction': 3,
            'StockOptionLevel': 1 if monthly_income > 6000 else 0,
            'TotalWorkingYears': years_at_company + 3,
            'TrainingTimesLastYear': 2,
            'WorkLifeBalance': data.get('WorkLifeBalance', base_sat),
            'YearsAtCompany': years_at_company,
            'YearsInCurrentRole': max(0, years_at_company - 2),
            'YearsSinceLastPromotion': promotion_gap,
            'YearsWithCurrManager': max(0, years_at_company - 1),
            'CompanyExperienceRatio': 0.5,
            'PromotionGap': promotion_gap,
            'IncomePerLevel': monthly_income / job_level,
            'ManagerStability': 2,
            'FrequentTraveller': 0,
            'LongDistance': 0,
            'HighIncome': 1 if monthly_income > 7000 else 0,
            'SeniorEmployee': 1 if years_at_company > 7 else 0,
            'BusinessTravel_Travel_Frequently': 0,
            'BusinessTravel_Travel_Rarely': 1,
            'Department_Research & Development': 1 if data.get('Department', '') == 'Research & Development' or data.get('Department', '') == 'R&D' else 0,
            'Department_Sales': 1 if data.get('Department', '') == 'Sales' else 0,
            'EducationField_Life Sciences': 1,
            'EducationField_Marketing': 0,
            'EducationField_Medical': 0,
            'EducationField_Other': 0,
            'EducationField_Technical Degree': 0,
            'Gender_Male': 1,
            'JobRole_Human Resources': 0,
            'JobRole_Laboratory Technician': 0,
            'JobRole_Manager': 1 if job_level >= 3 else 0,
            'JobRole_Manufacturing Director': 0,
            'JobRole_Research Director': 0,
            'JobRole_Research Scientist': 1 if job_level < 3 else 0,
            'JobRole_Sales Executive': 0,
            'JobRole_Sales Representative': 0,
            'MaritalStatus_Married': 1,
            'MaritalStatus_Single': 0,
            'OverTime_Yes': 1 if data.get('Overtime', False) else 0
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
