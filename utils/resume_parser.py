import os
import re
import io

# Optional imports handled gracefully
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    from pdfminer.high_level import extract_text as pdfminer_extract_text
except ImportError:
    pdfminer_extract_text = None

try:
    import docx2txt
except ImportError:
    docx2txt = None

DOMAINS_SKILLS = {
    "Software Developer": [
        "python", "java", "c++", "javascript", "c#", "ruby", "go", "php", "html", "css",
        "react", "angular", "vue", "node.js", "express", "django", "flask", "sql",
        "mysql", "postgresql", "mongodb", "git", "rest api", "graphql", "data structures",
        "algorithms", "software engineering", "web development", "backend", "frontend",
        "typescript", "jquery", "bootstrap", "tailwind", "next.js", "nest.js", "redis"
    ],
    "Data Scientist": [
        "data science", "machine learning", "deep learning", "artificial intelligence",
        "neural networks", "data analysis", "statistics", "pandas", "numpy", "scikit-learn",
        "tensorflow", "keras", "pytorch", "r programming", "data visualization", "tableau",
        "power bi", "nlp", "computer vision", "spark", "hadoop", "sql", "predictive modeling",
        "regression", "classification", "clustering", "seaborn", "matplotlib"
    ],
    "DevOps Engineer": [
        "devops", "docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "ci/cd",
        "terraform", "ansible", "linux", "bash", "nginx", "shell scripting", "cloud computing",
        "monitoring", "prometheus", "grafana", "git", "yaml", "vagrant", "chef", "puppet"
    ],
    "UI/UX Designer": [
        "ui/ux", "user experience", "user interface", "figma", "adobe xd", "sketch",
        "wireframing", "prototyping", "user research", "interaction design", "mockup",
        "photoshop", "illustrator", "usability testing", "design system", "information architecture"
    ],
    "Project Manager": [
        "project management", "agile", "scrum", "jira", "trello", "sprint", "budgeting",
        "risk assessment", "stakeholder management", "kanban", "pmp", "product strategy",
        "roadmap", "scrum master", "product management", "leadership"
    ],
    "Digital Marketer": [
        "digital marketing", "seo", "sem", "social media", "google analytics", "content marketing",
        "copywriting", "email marketing", "brand strategy", "adwords", "google ads", "facebook ads",
        "marketing campaign", "growth hacking", "lead generation"
    ]
}

COURSE_RECOMMENDATIONS = {
    "Software Developer": [
        "Introduction to Computer Science (CS50)",
        "The Complete Web Development Bootcamp",
        "Data Structures and Algorithms Specialization",
        "Modern React with Redux",
        "Backend Development Course (NodeJS & Express)"
    ],
    "Data Scientist": [
        "Machine Learning by Andrew Ng",
        "Python for Data Science and Machine Learning Bootcamp",
        "Deep Learning Specialization",
        "Applied Data Science with Python Specialization",
        "TensorFlow Developer Professional Certificate"
    ],
    "DevOps Engineer": [
        "Docker and Kubernetes: The Complete Guide",
        "DevOps Pre-Requisite Course",
        "AWS Certified Solutions Architect Associate",
        "Terraform & Ansible for System Administrators",
        "CI/CD Pipelines with Jenkins and GitHub Actions"
    ],
    "UI/UX Designer": [
        "Google UX Design Professional Certificate",
        "User Experience Research and Design Specialization",
        "UI/UX Design Masterclass (Figma)",
        "Interaction Design Foundation Courses",
        "Mobile App Design (iOS & Android UI/UX)"
    ],
    "Project Manager": [
        "Google Project Management Professional Certificate",
        "Agile Crash Course: Agile Project Management",
        "Scrum Alliance Product Owner / Scrum Master Certification prep",
        "PMP Exam Prep Seminar",
        "Product Management First Steps"
    ],
    "Digital Marketer": [
        "Google Digital Marketing & E-commerce Certificate",
        "SEO Specialization by UC Davis",
        "Social Media Marketing Specialization (Meta)",
        "Google Analytics 4 (GA4) Certification Course",
        "Copywriting Secrets for Digital Marketing"
    ]
}

ALL_SKILLS = []
for sks in DOMAINS_SKILLS.values():
    ALL_SKILLS.extend(sks)
ALL_SKILLS = sorted(list(set(ALL_SKILLS)))

def extract_text_from_pdf(file_path):
    text = ""
    # Method 1: Using pdfminer.six (very reliable text extraction)
    if pdfminer_extract_text:
        try:
            text = pdfminer_extract_text(file_path)
            if text and len(text.strip()) > 50:
                return text
        except Exception as e:
            print(f"pdfminer extraction failed: {e}")
            
    # Method 2: Fallback to PyPDF2
    if PyPDF2:
        try:
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                pages_text = []
                for page in reader.pages:
                    t = page.extract_text()
                    if t:
                        pages_text.append(t)
                text = "\n".join(pages_text)
        except Exception as e:
            print(f"PyPDF2 extraction failed: {e}")
            
    return text

def extract_text_from_docx(file_path):
    if docx2txt:
        try:
            return docx2txt.process(file_path)
        except Exception as e:
            print(f"docx2txt extraction failed: {e}")
    return ""

def get_number_of_pages(file_path):
    if PyPDF2:
        try:
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                return len(reader.pages)
        except Exception:
            pass
    return 1

def parse_resume(file_path):
    _, ext = os.path.splitext(file_path.lower())
    text = ""
    
    if ext == '.pdf':
        text = extract_text_from_pdf(file_path)
        pages = get_number_of_pages(file_path)
    elif ext == '.docx':
        text = extract_text_from_docx(file_path)
        pages = 1
    else:
        pages = 1
        
    if not text:
        return None
        
    # Clean text lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Extract Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else None
    
    # Extract Phone
    phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91\s?\d{10}|\b\d{10}\b'
    phone_match = re.search(phone_pattern, text)
    phone = phone_match.group(0) if phone_match else None
    
    # Extract Name (Guessing name from first 4 lines that aren't emails or phones or generic info)
    name = None
    for line in lines[:4]:
        clean_line = re.sub(r'[^a-zA-Z\s]', '', line).strip()
        words = clean_line.split()
        # A name usually consists of 2-3 words, mostly capitalized
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
            if email and email.split('@')[0].lower() in clean_line.lower():
                name = clean_line
                break
            name = clean_line
            break
            
    if not name and lines:
        name = re.sub(r'[^a-zA-Z\s]', '', lines[0]).strip()
        
    # Extract Skills
    detected_skills = []
    text_lower = text.lower()
    for skill in ALL_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Capitalize properly for display
            detected_skills.append(skill.title() if len(skill) > 3 else skill.upper())
            
    detected_skills = list(set(detected_skills))
    
    # Evaluate Section Scores
    score_breakdown = {
        "Objective/Summary": 0,
        "Education": 0,
        "Experience": 0,
        "Skills": 0,
        "Projects": 0,
        "Certifications": 0,
        "Hobbies/Interests": 0,
        "ATS Guidelines Check": 27 # Starts with base compliance points
    }
    
    # Search for section keywords
    if re.search(r'\b(objective|summary|profile|about me)\b', text_lower):
        score_breakdown["Objective/Summary"] = 6
    if re.search(r'\b(education|academic|school|college|university|degree)\b', text_lower):
        score_breakdown["Education"] = 12
    if re.search(r'\b(experience|employment|work history|career|professional experience)\b', text_lower):
        score_breakdown["Experience"] = 16
    if re.search(r'\b(skills|technical skills|expertise|proficiencies)\b', text_lower):
        score_breakdown["Skills"] = 7
    if re.search(r'\b(projects|personal projects|academic projects)\b', text_lower):
        score_breakdown["Projects"] = 19
    if re.search(r'\b(certifications|certifications|awards|credentials)\b', text_lower):
        score_breakdown["Certifications"] = 12
    if re.search(r'\b(hobbies|interests|extracurriculars|activities)\b', text_lower):
        score_breakdown["Hobbies/Interests"] = 9
        
    # Deduct formatting compliance points if tables, columns or too long
    recommendations = []
    if pages > 2:
        score_breakdown["ATS Guidelines Check"] -= 10
        recommendations.append("Your resume is over 2 pages. Try to condense it to 1 or 2 pages maximum for ATS readability. (Context: Length)")
    if len(detected_skills) < 5:
        recommendations.append("Consider adding more industry-relevant skills to showcase your abilities. (Context: Skills)")
    if not email:
        score_breakdown["ATS Guidelines Check"] -= 5
        recommendations.append("Email address not found. Ensure contact details are clear. (Context: Contact Details)")
    if not phone:
        score_breakdown["ATS Guidelines Check"] -= 5
        recommendations.append("Phone number not found. Recruiters need a way to reach you. (Context: Contact Details)")
        
    # Section missing recommendations
    if score_breakdown["Objective/Summary"] == 0:
        recommendations.append("Add a brief Professional Summary or Objective at the top to describe your career direction. (Context: Section Missing)")
    if score_breakdown["Experience"] == 0:
        recommendations.append("Add a Work Experience section detailing your previous jobs, internships, or freelance work. (Context: Section Missing)")
    if score_breakdown["Projects"] == 0:
        recommendations.append("Add a Projects section displaying your hands-on development work. (Context: Section Missing)")
    if score_breakdown["Certifications"] == 0:
        recommendations.append("Add relevant Certifications or Online Courses to validate your self-learning. (Context: Section Missing)")

    # Calculate final ATS Score
    total_score = sum(score_breakdown.values())
    total_score = max(0, min(100, total_score)) # Clamp between 0 and 100
    score_details = {
        "score": total_score,
        "breakdown": score_breakdown
    }
    
    # Classify Domain
    best_domain = "Software Developer"
    max_matches = 0
    for domain, skills_list in DOMAINS_SKILLS.items():
        matches = sum(1 for skill in skills_list if skill.lower() in [s.lower() for s in detected_skills])
        if matches > max_matches:
            max_matches = matches
            best_domain = domain
            
    # Recommendations & course list
    recommended_courses = COURSE_RECOMMENDATIONS.get(best_domain, COURSE_RECOMMENDATIONS["Software Developer"])
    
    # Recommended skills (which are in classified domain list but NOT in detected_skills)
    domain_skills_list = DOMAINS_SKILLS[best_domain]
    rec_skills_to_learn = [s.title() for s in domain_skills_list if s.lower() not in [sd.lower() for sd in detected_skills]]
    rec_skills_to_learn = rec_skills_to_learn[:5] # Suggest top 5 missing skills
    
    # Fallbacks if none
    if not rec_skills_to_learn:
        rec_skills_to_learn = ["System Design", "Cloud Architecture", "Agile Methodologies", "Docker"]
        
    return {
        "success": True,
        "data": {
            "name": name,
            "email": email,
            "mobile_number": phone,
            "skills": detected_skills,
            "college_name": None,
            "degree": ["B.Tech / Degree"] if score_breakdown["Education"] > 0 else [],
            "designation": [best_domain] if score_breakdown["Experience"] > 0 else [],
            "experience": None,
            "company_names": None,
            "no_of_pages": pages,
            "total_experience": 1 if score_breakdown["Experience"] > 0 else 0
        },
        "score_details": score_details,
        "domain": best_domain,
        "recommendations": recommendations,
        "recommended_courses": recommended_courses,
        "recommended_skills": rec_skills_to_learn
    }
