
import { useState } from 'react';
import { MapPin, Briefcase, DollarSign, Clock, Search, Filter, Bookmark, Building } from 'lucide-react';
import '../styles/JobBoard.css';

const jobsData = [
  {
    id: 1,
    title: 'Senior Machine Learning Engineer',
    company: 'Google DeepMind',
    location: 'London, UK',
    type: 'Full-time',
    salary: '$150k - $250k',
    techStack: ['Python', 'TensorFlow', 'PyTorch', 'Kubernetes'],
    description: 'Join our team working on cutting-edge AI research and applications.',
    posted: '2 days ago',
    applicants: 47,
    logo: '🔷',
  },
  {
    id: 2,
    title: 'AI Research Scientist',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$180k - $300k',
    techStack: ['Python', 'JAX', 'Distributed Systems', 'NLP'],
    description: 'Advance the field of AI safety and alignment through groundbreaking research.',
    posted: '1 day ago',
    applicants: 124,
    logo: '🤖',
  },
  {
    id: 3,
    title: 'Computer Vision Engineer',
    company: 'Tesla',
    location: 'Palo Alto, CA',
    type: 'Full-time',
    salary: '$140k - $220k',
    techStack: ['C++', 'Python', 'CUDA', 'Computer Vision'],
    description: 'Develop autonomous driving technology using state-of-the-art computer vision.',
    posted: '3 days ago',
    applicants: 89,
    logo: '🚗',
  },
  {
    id: 4,
    title: 'NLP Engineer',
    company: 'Anthropic',
    location: 'Remote',
    type: 'Full-time',
    salary: '$160k - $240k',
    techStack: ['Python', 'Transformers', 'PyTorch', 'LLMs'],
    description: 'Build next-generation language models with a focus on safety and reliability.',
    posted: '5 days ago',
    applicants: 102,
    logo: '🧠',
  },
  {
    id: 5,
    title: 'AI Product Manager',
    company: 'Microsoft',
    location: 'Seattle, WA',
    type: 'Full-time',
    salary: '$130k - $200k',
    techStack: ['Product Strategy', 'AI/ML', 'Agile', 'Analytics'],
    description: 'Lead AI product initiatives and drive strategic vision for enterprise solutions.',
    posted: '1 week ago',
    applicants: 65,
    logo: '💼',
  },
  {
    id: 6,
    title: 'ML Infrastructure Engineer',
    company: 'Meta',
    location: 'Menlo Park, CA',
    type: 'Full-time',
    salary: '$155k - $235k',
    techStack: ['Python', 'Kubernetes', 'MLOps', 'AWS'],
    description: 'Build scalable infrastructure for training and deploying ML models at scale.',
    posted: '4 days ago',
    applicants: 56,
    logo: '🔧',
  },
];

export function JobBoard({ preview = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [savedJobs, setSavedJobs] = useState(new Set());

  const displayedJobs = preview ? jobsData.slice(0, 3) : jobsData;

  const toggleSaveJob = (id) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredJobs = displayedJobs.filter(
    (job) =>
      (filterType === 'All' || job.type === filterType) &&
      (searchTerm === '' ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.techStack.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase())))
  );


  return (
    <div className="job-board-container">
      {!preview && (
        <div className="job-board-controls">
          <div className="job-board-search-section">
            <div className="job-board-search-wrapper">
                <Search className="job-board-search-icon" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="job-board-search-input"
                />
            </div>
            <div className="job-board-filter-wrapper">
                <Filter className="job-board-filter-icon" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="job-board-filter-select"
                >
                  <option value="All">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
            </div>
          </div>
          <div className="job-board-ats-section">
            <h4 className="job-board-ats-title">ATS Simulation Available</h4>
            <p className="job-board-ats-description">
              Practice with our Applicant Tracking System simulator to optimize your resume and increase your chances.
            </p>
          </div>
        </div>
      )}


      <div className="job-board-list">
        {filteredJobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-card-header">
              <div className="job-company-info">
                <div className="job-company-logo">{job.logo}</div>
                <div className="job-details">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-company">
                    <Building className="w-4 h-4" />
                    <span>{job.company}</span>
                  </div>
                  <p className="job-description job-board-clamp-2">{job.description}</p>
                </div>
              </div>
              <button onClick={() => toggleSaveJob(job.id)} className={`job-bookmark-btn ${savedJobs.has(job.id) ? 'active' : ''}`}>
                <Bookmark className="w-6 h-6" />
              </button>
            </div>

            <div className="job-details-grid">
              <div className="job-detail"><MapPin className="w-4 h-4" /><span>{job.location}</span></div>
              <div className="job-detail"><Briefcase className="w-4 h-4" /><span>{job.type}</span></div>
              <div className="job-detail"><DollarSign className="w-4 h-4" /><span>{job.salary}</span></div>
              <div className="job-detail"><Clock className="w-4 h-4" /><span>{job.posted}</span></div>
            </div>

            <div className="job-tech-stack">
              {job.techStack.map((tech) => (
                <span key={tech} className="job-tech-tag">
                  {tech}
                </span>
              ))}
            </div>

            <div className="job-card-footer">
              <span className="job-applicants">{job.applicants} applicants</span>
              <button className="job-apply-btn">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>


      {!preview && (
        <div className="job-board-cta">
          <h3 className="job-board-cta-title">Prepare for Your Interview</h3>
          <p className="job-board-cta-description">
            Access our comprehensive interview preparation resources, including practice questions, mock interviews, and expert tips.
          </p>
          <button className="job-board-cta-btn">
            Start Preparing
          </button>
        </div>
      )}
    </div>
  );
}
