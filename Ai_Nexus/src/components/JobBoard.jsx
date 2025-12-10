import { useState } from 'react';
import { MapPin, Briefcase, DollarSign, Clock, Search, Filter, Bookmark, Building } from 'lucide-react';

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!preview && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
            </div>
            <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full appearance-none pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
            </div>
          </div>
          <div className="bg-sky-50 dark:bg-sky-900/50 border border-sky-200 dark:border-sky-800 rounded-lg p-6">
            <h4 className="font-bold text-sky-800 dark:text-sky-200 mb-2">ATS Simulation Available</h4>
            <p className="text-sm text-sky-700 dark:text-sky-300">
              Practice with our Applicant Tracking System simulator to optimize your resume and increase your chances.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{job.logo}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1 mb-2">
                    <Building className="w-4 h-4" />
                    <span>{job.company}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 clamp-2">{job.description}</p>
                </div>
              </div>
              <button onClick={() => toggleSaveJob(job.id)} className="p-2 text-slate-400 hover:text-sky-500 dark:text-slate-500 dark:hover:text-sky-400 transition-colors">
                <Bookmark className={`w-6 h-6 ${savedJobs.has(job.id) ? 'fill-current text-sky-500 dark:text-sky-400' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400 my-4">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{job.location}</span></div>
              <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /><span>{job.type}</span></div>
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /><span>{job.salary}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{job.posted}</span></div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.techStack.map((tech) => (
                <span key={tech} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                  {tech}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">{job.applicants} applicants</span>
              <button className="bg-sky-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 transition-colors">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {!preview && (
        <div className="mt-12 text-center bg-gradient-to-r from-purple-600 to-sky-600 text-white rounded-xl p-8 md:p-12">
          <h3 className="text-2xl font-bold mb-2">Prepare for Your Interview</h3>
          <p className="max-w-2xl mx-auto mb-6">
            Access our comprehensive interview preparation resources, including practice questions, mock interviews, and expert tips.
          </p>
          <button className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors">
            Start Preparing
          </button>
        </div>
      )}
    </div>
  );
}
