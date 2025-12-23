# Career & Events Module Implementation Plan

## Current State Analysis

### ✅ EXISTING COMPONENTS FOUND:
1. **Job System**: Job.js model, JobApplication.js model, jobs.js routes, JobBoard.jsx component
2. **Event System**: Event.js model, EventRegistration.js model, events.js routes, Events.jsx component
3. **Authentication**: Role-based auth middleware with 'user' and 'company' roles
4. **Database**: MongoDB models already structured with proper indexes

### ❌ GAPS IDENTIFIED:

#### Career Module Issues:
- Job model has `title` instead of `jobTitle`
- Job model has `requirements` instead of `skillsRequired`
- Missing `applyDeadline` field
- `companyName` is not auto-populated from company profile
- Frontend doesn't properly hide "Create Job" button for USER role

#### Events Module Issues:
- Event model lacks proper event type enum (Seminar, Hackathon, Quiz, Workshop)
- Missing `registrationDeadline` field
- Event creation logic doesn't enforce COMPANY-only access
- Frontend doesn't properly hide "Create Event" button for USER role

#### Access Control Issues:
- Backend routes may not have proper role enforcement
- Frontend-only checks need backend validation
- Missing comprehensive role-based middleware

## Implementation Plan

### Phase 1: Backend Schema Updates
1. **Update Job Model**
   - Add `jobTitle` field (rename from `title`)
   - Add `skillsRequired` field (rename from `requirements`)
   - Add `applyDeadline` field
   - Ensure `companyName` auto-populates from company profile
   - Update validation rules

2. **Update Event Model**
   - Update `eventType` enum to include: Seminar, Hackathon, Quiz, Workshop
   - Add `registrationDeadline` field
   - Update validation and indexing

3. **Enhanced Role-Based Middleware**
   - Create `allowCompanyOnly` middleware
   - Create `allowUserOrCompany` middleware
   - Add resource ownership checks

### Phase 2: Backend Route Updates
1. **Jobs Routes Enhancement**
   - Update all endpoints with proper role validation
   - Add job application workflow
   - Add company job management endpoints
   - Add applicant viewing for companies

2. **Events Routes Enhancement**
   - Update event creation to COMPANY-only
   - Add event registration for both USER and COMPANY
   - Add participant viewing for event organizers
   - Update registration workflow

### Phase 3: Frontend Component Updates
1. **JobBoard Component**
   - Hide "Create Job" button for USER role
   - Update form fields to match new schema
   - Add job application modal
   - Add application status tracking

2. **Events Component**
   - Hide "Create Event" button for USER role
   - Update event creation form
   - Add event registration flow
   - Add registration confirmation

3. **Role-Based UI Components**
   - Create RoleBasedComponents for conditional rendering
   - Update navigation based on user role
   - Add proper error handling for unauthorized access

### Phase 4: Service Layer Updates
1. **jobService.js**
   - Update API calls to match new schema
   - Add job application methods
   - Add company job management methods

2. **eventService.js**
   - Update event creation/management
   - Add event registration methods
   - Add participant management methods

### Phase 5: Testing & Validation
1. **Backend Testing**
   - Test role-based access control
   - Test all CRUD operations
   - Test application/registration workflows
   - Test security (unauthorized access attempts)

2. **Frontend Testing**
   - Test role-based UI visibility
   - Test user flows for both roles
   - Test error handling
   - Test responsive design

## Key Security Measures

### Backend Security:
1. **Role Enforcement**: All routes must check user role before allowing actions
2. **Ownership Validation**: Companies can only manage their own jobs/events
3. **Input Validation**: Comprehensive validation on all inputs
4. **Error Handling**: Meaningful error messages without information leakage

### Frontend Security:
1. **UI Role-Based Rendering**: Hide create buttons for unauthorized roles
2. **Graceful Degradation**: Handle unauthorized API responses gracefully
3. **User Feedback**: Clear messaging for permission issues

## Success Criteria

### Functional Requirements:
- ✅ COMPANY can create/edit/delete job vacancies
- ✅ USER cannot create job vacancies
- ✅ USER can apply for jobs
- ✅ COMPANY can view job applicants
- ✅ COMPANY can create events
- ✅ USER cannot create events
- ✅ Both USER and COMPANY can register for events
- ✅ COMPANY can view event participants

### Technical Requirements:
- ✅ Role-based middleware enforces access control
- ✅ Backend returns 403 Forbidden for unauthorized requests
- ✅ Frontend UI reflects user permissions
- ✅ Database schemas match requirements
- ✅ No breaking changes to existing functionality

## Implementation Steps

1. **Update Job Model Schema**
2. **Update Event Model Schema**
3. **Create Enhanced Middleware**
4. **Update Jobs Routes**
5. **Update Events Routes**
6. **Update JobBoard Component**
7. **Update Events Component**
8. **Update Service Layer**
9. **Test All Functionality**
10. **Documentation Update
