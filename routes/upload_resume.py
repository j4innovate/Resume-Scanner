from flask import Blueprint, jsonify, request
import os
import sys

from utils.resume_parser import parse_resume

upload_resume_bp = Blueprint('upload_resume', __name__)

@upload_resume_bp.route("/upload-resume", methods=["POST"])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400
        
    # Ensure uploads directory exists
    uploads_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    path = os.path.join(uploads_dir, file.filename)
    file.save(path)
    
    # Run our custom parsing engine
    report = parse_resume(path)
    
    if not report:
        return jsonify({"success": False, "error": "Unable to extract text from the file"}), 400
        
    return jsonify(report)
    
