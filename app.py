from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
CORS(app) # Allow cross-origin requests from frontend

# Register blueprints
from routes.upload_resume import upload_resume_bp
app.register_blueprint(upload_resume_bp)

from routes.get_resume_data import get_resume_data_bp
app.register_blueprint(get_resume_data_bp)

from routes.recommend_courses import recommend_courses_bp
app.register_blueprint(recommend_courses_bp)


from routes.recommend_skills import recommend_skills_bp
app.register_blueprint(recommend_skills_bp)

from routes.ats_recommendations import ats_recommendations_bp
app.register_blueprint(ats_recommendations_bp)

from routes.overall_score import overall_score_bp
app.register_blueprint(overall_score_bp)

@app.route("/")
def index():
    return "hello world!"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
