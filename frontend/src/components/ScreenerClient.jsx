import React, { useState, useEffect } from 'react';

const ScreenerClient = () => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const steps = [
    "Uploading resume file...",
    "Extracting text layout & structure...",
    "Analyzing skill semantic matching...",
    "Evaluating ATS rules compliance...",
    "Generating score reports..."
  ];

  useEffect(() => {
    let interval;
    if (loading && scanStep < steps.length - 1) {
      interval = setInterval(() => {
        setScanStep((prev) => prev + 1);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [loading, scanStep]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startScan = async () => {
    if (!file) return;
    setLoading(true);
    setScanStep(0);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Small timeout to allow the loader steps to animate smoothly
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      const response = await fetch('http://localhost:5000/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze the resume. Make sure the backend server is running.');
      }

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        throw new Error(data.error || 'Unknown error occurred during parsing.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 text-white font-sans">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-rubik tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          ATS Resume Screener
        </h1>
        <p className="text-gray-400 mt-3 text-lg max-w-xl mx-auto">
          Upload your resume in PDF or DOCX format to receive an instant ATS score, formatting breakdown, and course recommendations.
        </p>
      </div>

      {/* Upload Screen */}
      {!loading && !result && (
        <div className="bg-[#15193B] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 md:p-12 flex flex-col items-center justify-center transition-all duration-300 ${
              isDragOver 
                ? 'border-[#6938EF] bg-[#6938EF]/5' 
                : 'border-white/20 hover:border-white/40 bg-[#0C1030]/50'
            }`}
          >
            {/* Upload Icon */}
            <div className="w-16 h-16 rounded-full bg-[#6938EF]/10 flex items-center justify-center mb-6 text-[#6938EF]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold mb-2">Drag and drop your resume</h3>
            <p className="text-gray-400 text-sm mb-6">Supports PDF & DOCX (Max 10MB)</p>

            <label className="bg-[#6938EF] hover:bg-[#5629D4] transition-all cursor-pointer font-semibold text-white px-6 py-3 rounded-lg shadow-lg">
              Browse File
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <div className="mt-8 flex items-center gap-3 bg-[#15193B] border border-white/10 px-4 py-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="text-sm font-medium">{file.name}</span>
                <button 
                  onClick={() => setFile(null)} 
                  className="text-red-400 hover:text-red-300 text-sm p-1 ml-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 bg-red-900/20 border border-red-800/40 text-red-300 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={startScan}
              disabled={!file}
              className={`w-full md:w-auto font-semibold px-10 py-4 rounded-xl transition-all shadow-xl ${
                file 
                  ? 'bg-gradient-to-r from-[#6938EF] to-[#444CE7] hover:from-[#5629D4] hover:to-[#353CBC] text-white active:scale-95' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              Analyze Resume
            </button>
          </div>
        </div>
      )}

      {/* Loading Loader Screen */}
      {loading && (
        <div className="bg-[#15193B] border border-white/10 rounded-2xl p-12 shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
          {/* Animated Spinner with Gradient */}
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#6938EF] border-r-[#444CE7] animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-400">
              {Math.min(Math.round((scanStep + 1) * 20), 99)}%
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2">Analyzing Resume</h3>
          <div className="h-2 w-64 bg-white/5 rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-gradient-to-r from-[#6938EF] to-[#444CE7] transition-all duration-700 rounded-full"
              style={{ width: `${(scanStep + 1) * 20}%` }}
            ></div>
          </div>
          
          <p className="text-[#6938EF] text-lg font-medium animate-pulse">
            {steps[scanStep]}
          </p>
        </div>
      )}

      {/* Results Screen */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Summary Block */}
          <div className="bg-[#15193B] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            {/* Score Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke="url(#scoreGrad)" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (263.89 * result.score_details.score) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6938EF" />
                    <stop offset="100%" stopColor="#444CE7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold font-rubik leading-none">{result.score_details.score}</span>
                <span className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">ATS Score</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <span className="inline-block bg-[#6938EF]/10 text-[#6938EF] border border-[#6938EF]/20 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                {result.domain || "Unknown Domain"}
              </span>
              <h2 className="text-3xl font-bold font-rubik">{result.data.name || "Candidate Name"}</h2>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-gray-300">
                {result.data.email && (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#6938EF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    {result.data.email}
                  </span>
                )}
                {result.data.mobile_number && (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#6938EF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    {result.data.mobile_number}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#6938EF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  {result.data.no_of_pages} Page{result.data.no_of_pages > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <button 
              onClick={() => { setResult(null); setFile(null); }}
              className="px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-sm transition-all"
            >
              Scan Again
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col - Breakdown & Skills */}
            <div className="lg:col-span-2 space-y-8">
              {/* Detailed Breakdown */}
              <div className="bg-[#15193B] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                <h3 className="text-xl font-bold font-rubik mb-6 border-b border-white/5 pb-4">ATS Checklist & Section Scores</h3>
                
                <div className="space-y-4">
                  {Object.entries(result.score_details.breakdown).map(([section, score]) => {
                    const maxScore = section === "Experience" ? 16 : section === "Education" ? 12 : section === "Projects" ? 19 : section === "Certifications" ? 12 : section === "Skills" ? 7 : section === "Objective/Summary" ? 6 : section === "Hobbies/Interests" ? 9 : 27;
                    const percent = (score / maxScore) * 100;
                    return (
                      <div key={section} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-200">{section}</span>
                          <span className="text-gray-400">{score}/{maxScore} pts</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${percent >= 70 ? 'bg-emerald-500' : percent >= 45 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Extracted Skills */}
              <div className="bg-[#15193B] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                <h3 className="text-xl font-bold font-rubik mb-6 border-b border-white/5 pb-4">Extracted Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.data.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="bg-white/5 hover:bg-white/10 text-gray-200 px-3 py-1.5 rounded-lg border border-white/5 transition-all text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {result.data.skills.length === 0 && (
                    <span className="text-gray-500 text-sm">No standard skills recognized in the document text.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col - Recommendations & Courses */}
            <div className="space-y-8">
              {/* Recommendations */}
              <div className="bg-[#15193B] border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold font-rubik mb-4 border-b border-white/5 pb-3">ATS Guidelines Check</h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-gray-300">
                      <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      <span>{rec}</span>
                    </li>
                  ))}
                  {result.recommendations.length === 0 && (
                    <li className="flex gap-2.5 text-sm text-emerald-400">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <span>Your formatting meets all ATS parameters! Excellent work.</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Recommended Skills */}
              <div className="bg-[#15193B] border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold font-rubik mb-4 border-b border-white/5 pb-3">Recommended Skills to Add</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.recommended_skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="bg-indigo-500/10 border border-indigo-500/20 text-[#E0EAFF] text-xs font-semibold px-2.5 py-1 rounded"
                    >
                      +{skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Courses */}
              <div className="bg-[#15193B] border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold font-rubik mb-4 border-b border-white/5 pb-3">Recommended Free Courses</h3>
                <ul className="space-y-3.5">
                  {result.recommended_courses.map((course, idx) => (
                    <li key={idx} className="group">
                      <a 
                        href={`https://www.coursera.org/search?query=${encodeURIComponent(course)}`} 
                        target="_blank" 
                        className="flex items-start justify-between text-sm text-gray-300 hover:text-white font-medium transition-colors"
                      >
                        <span>{course}</span>
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenerClient;
