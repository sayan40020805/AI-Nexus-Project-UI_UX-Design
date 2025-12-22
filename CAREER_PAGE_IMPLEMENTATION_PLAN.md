# Dynamic Career Page Implementation Plan

## Task Overview
Update the career page to be fully dynamic with company-specific job vacancy creation and user application functionality.

## Requirements Analysis
1. **Company Users**: When company users click "Career", they should see a "Create Job Vacancy" option
2. **User Applications**: Regular users should only be able to register/apply for jobs
3. **Database Storage**: All job data and applications must be stored in the database
4. **Dynamic Content**: Remove all static job data and make everything dynamic

## Current State Analysis
- ✅ User authentication system with role-based access (user/company)
- ✅ Existing User model with company fields (companyName, companyDescription, companyLogo)
- ✅ Static JobBoard component with hardcoded job data
- ✅ Career page routing already configured
- ❌ No Job model for database storage
- ❌ No Job Application functionality
- ❌ Static job data in frontend component

## Implementation Plan

### Phase 1: Database Models (Backend)
1. **Create Job Model** (`backend/models/Job.js`)
   - Job details (title, description, requirements, salary, location, type)
   - Company reference (linking to User with role='company')
   - Application tracking (number of applicants, status)
   - Timestamps for posting and updates

2. **Create JobApplication Model** (`backend/models/JobApplication.js`)
   - Reference to Job
   - Reference to User (applicant)
   - Application status (pending, accepted, rejected)
   - Application data (resume, cover letter, additional info)
   - Timestamps

### Phase 2: Backend API Routes
3. **Job Management Routes** (`backend/routes/jobs.js`)
   - `GET /api/jobs` - Get all jobs (with filtering/search)
   - `POST /api/jobs` - Create new job vacancy (company only)
   - `PUT /api/jobs/:id` - Update job (company only, own jobs)
   - `DELETE /api/jobs/:id` - Delete job (company only, own jobs)
   - `GET /api/jobs/:id` - Get single job details

4. **Application Management Routes** (`backend/routes/jobApplications.js`)
   - `POST /api/jobs/:id/apply` - Apply for a job (user only)
   - `GET /api/applications` - Get user's applications
   - `GET /api/company/applications` - Get applications for company's jobs
   - `PUT /api/applications/:id/status` - Update application status

### Phase 3: Frontend Components
5. **Update JobBoard Component** (`Ai_Nexus/src/components/JobBoard.jsx`)
   - Remove static job data
   - Fetch jobs from API
   - Add role-based rendering
   - Add search and filter functionality
   - Add apply button for users

6. **Create JobVacancyForm Component** (`Ai_Nexus/src/components/JobVacancyForm.jsx`)
   - Form for companies to create/edit job vacancies
   - Form fields: title, description, requirements, salary, location, type
   - Company logo and name auto-populated

7. **Create JobApplicationModal Component** (`Ai_Nexus/src/components/JobApplicationModal.jsx`)
   - Modal for users to apply for jobs
   - Form fields: resume upload, cover letter, additional info
   - Integration with application API

8. **Update Career Page** (`Ai_Nexus/src/pages/Career/Career.jsx`)
   - Role-based conditional rendering
   - Show "Create Job Vacancy" button for companies
   - Show job board for all users
   - Add job creation and application flows

### Phase 4: Integration & Testing
9. **Update API Integration**
   - Add job-related API calls to frontend services
   - Implement proper error handling and loading states
   - Add authentication headers for protected routes

10. **Role-Based Access Control**
    - Ensure companies can only manage their own jobs
    - Ensure users can only apply to jobs (not create them)
    - Implement proper middleware validation

## Key Features to Implement

### For Company Users:
- ✅ "Create Job Vacancy" button on career page
- ✅ Job creation form with all necessary fields
- ✅ Job management dashboard (edit/delete own jobs)
- ✅ View applications received for their jobs
- ✅ Application status management

### For Regular Users:
- ✅ Browse all available job vacancies
- ✅ Search and filter jobs
- ✅ Apply for jobs with resume/cover letter
- ✅ Track application status
- ✅ Save/bookmark jobs

### Technical Implementation:
- ✅ Database models for jobs and applications
- ✅ RESTful API endpoints
- ✅ Role-based authentication
- ✅ File upload for resumes
- ✅ Real-time application counts
- ✅ Email notifications (optional)

## File Structure Changes
```
backend/models/
├── Job.js (NEW)
├── JobApplication.js (NEW)

backend/routes/
├── jobs.js (NEW)
├── jobApplications.js (NEW)

frontend/src/components/
├── JobBoard.jsx (UPDATED)
├── JobVacancyForm.jsx (NEW)
├── JobApplicationModal.jsx (NEW)
├── CompanyJobManagement.jsx (NEW)

frontend/src/pages/
└── Career/
    ├── Career.jsx (UPDATED)
    └── MyJobs.jsx (NEW)

frontend/src/services/
└── jobService.js (NEW)
```

## Success Criteria
1. ✅ Companies can create, edit, and delete job vacancies
2. ✅ Users can browse, search, and apply for jobs
3. ✅ All job data is stored in database (no static data)
4. ✅ Role-based access control works correctly
5. ✅ Application tracking is functional
6. ✅ UI is intuitive for both user types
7. ✅ All CRUD operations work smoothly

## Next Steps
Once approved, I will proceed with Phase 1 implementation (Database Models) and continue through each phase systematically.
