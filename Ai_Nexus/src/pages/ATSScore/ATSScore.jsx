import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, Star } from 'lucide-react';
import '../../styles/ATSScore.css';

const atsRecommendations = [
  {
    category: 'Keywords',
    score: 85,
    status: 'good',
    suggestions: [
      'Add more industry-specific keywords like "machine learning", "data analysis", "AI implementation"',
      'Include relevant soft skills: "problem-solving", "collaboration", "leadership"',
      'Mention specific technologies: "Python", "TensorFlow", "SQL", "AWS"'
    ]
  },
  {
    category: 'Format',
    score: 72,
    status: 'warning',
    suggestions: [
      'Use standard section headers: Experience, Education, Skills',
      'Keep bullet points concise (1-2 lines each)',
      'Use reverse chronological order for experience'
    ]
  },
  {
    category: 'Length',
    score: 90,
    status: 'good',
    suggestions: [
      'Resume length is optimal (2 pages)',
      'Good balance of content and white space',
      'Each section is well-organized'
    ]
  },
  {
    category: 'Skills',
    score: 68,
    status: 'warning',
    suggestions: [
      'Add more technical skills relevant to your target role',
      'Include proficiency levels (Beginner, Intermediate, Expert)',
      'Group related skills together'
    ]
  }
];

const tipsData = [
  {
    title: 'Use Action Verbs',
    description: 'Start bullet points with strong action verbs like "developed", "implemented", "optimized"',
    example: 'Developed machine learning models that improved accuracy by 25%'
  },
  {
    title: 'Quantify Achievements',
    description: 'Include specific numbers and metrics to demonstrate impact',
    example: 'Increased data processing efficiency by 40% through automated workflows'
  },
  {
    title: 'Tailor to Job Description',
    description: 'Mirror the language and keywords used in the job posting',
    example: 'If job mentions "deep learning", ensure this appears in your resume'
  },
  {
    title: 'Keep It ATS-Friendly',
    description: 'Avoid complex formatting, tables, or images that ATS systems can\'t read',
    example: 'Use standard fonts like Arial, Calibri, or Times New Roman'
  }
];

export function ATSScore() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setIsAnalyzing(true);
      
      // Simulate analysis
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 3000);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const overallScore = Math.round(
    atsRecommendations.reduce((acc, item) => acc + item.score, 0) / atsRecommendations.length
  );

  return (
    <div className="ats-score-container">
      <div className="ats-score-header">
        <div className="ats-score-icon">
          <FileText className="w-8 h-8" />
        </div>
        <div className="ats-score-title">
          <h1>ATS Score Analyzer</h1>
          <p>Upload your resume to get instant feedback and improve your ATS compatibility</p>
        </div>
      </div>

      {!uploadedFile && (
        <div className="ats-upload-section">
          <div className="ats-upload-card">
            <div className="ats-upload-icon">
              <Upload className="w-12 h-12" />
            </div>
            <h3>Upload Your Resume</h3>
            <p>Get detailed analysis of how well your resume will perform with ATS systems</p>
            
            <div className="ats-upload-formats">
              <span className="ats-format">PDF</span>
              <span className="ats-format">DOC</span>
              <span className="ats-format">DOCX</span>
            </div>

            <label className="ats-upload-btn">
              Choose File
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="ats-features">
            <h3>What We Analyze</h3>
            <div className="ats-feature-grid">
              <div className="ats-feature">
                <CheckCircle className="w-5 h-5" />
                <span>Keyword optimization</span>
              </div>
              <div className="ats-feature">
                <CheckCircle className="w-5 h-5" />
                <span>Format compatibility</span>
              </div>
              <div className="ats-feature">
                <CheckCircle className="w-5 h-5" />
                <span>Content structure</span>
              </div>
              <div className="ats-feature">
                <CheckCircle className="w-5 h-5" />
                <span>Skills matching</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="ats-analyzing">
          <div className="ats-analyzing-spinner"></div>
          <h3>Analyzing Your Resume...</h3>
          <p>Our AI is scanning for ATS compatibility, keywords, and optimization opportunities</p>
        </div>
      )}

      {analysisComplete && (
        <div className="ats-results">
          <div className="ats-score-overview">
            <div className="ats-score-circle">
              <div className="ats-score-number">{overallScore}%</div>
              <div className="ats-score-label">ATS Score</div>
            </div>
            <div className="ats-score-status">
              <h2>{overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}</h2>
              <p>Your resume has {overallScore >= 80 ? 'strong' : 'moderate'} ATS compatibility</p>
            </div>
          </div>

          <div className="ats-recommendations">
            <h3>Detailed Analysis</h3>
            <div className="ats-recommendations-grid">
              {atsRecommendations.map((rec, index) => (
                <div key={index} className="ats-recommendation-card">
                  <div className="ats-recommendation-header">
                    <div className="ats-recommendation-title">
                      {getStatusIcon(rec.status)}
                      <h4>{rec.category}</h4>
                    </div>
                    <div className="ats-recommendation-score">
                      <span>{rec.score}%</span>
                    </div>
                  </div>
                  <div className="ats-recommendation-bar">
                    <div 
                      className="ats-recommendation-progress"
                      style={{ 
                        width: `${rec.score}%`,
                        backgroundColor: getStatusColor(rec.status)
                      }}
                    ></div>
                  </div>
                  <ul className="ats-suggestions">
                    {rec.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="ats-actions">
            <button className="ats-action-btn ats-download">
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button 
              className="ats-action-btn ats-upload-new"
              onClick={() => {
                setUploadedFile(null);
                setAnalysisComplete(false);
                setIsAnalyzing(false);
              }}
            >
              Upload New Resume
            </button>
          </div>
        </div>
      )}

      {analysisComplete && (
        <div className="ats-tips">
          <h3>Pro Tips for Better ATS Scores</h3>
          <div className="ats-tips-grid">
            {tipsData.map((tip, index) => (
              <div key={index} className="ats-tip-card">
                <div className="ats-tip-header">
                  <Star className="w-5 h-5" />
                  <h4>{tip.title}</h4>
                </div>
                <p className="ats-tip-description">{tip.description}</p>
                <div className="ats-tip-example">
                  <strong>Example:</strong> {tip.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ATSScore;
