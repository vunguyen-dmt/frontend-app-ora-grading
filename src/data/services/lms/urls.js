import { StrictDict } from 'utils';
import { getConfig } from '@edx/frontend-platform';

const baseUrl = () => getConfig().LMS_BASE_URL;

const api = () => `${baseUrl()}/api/`;
const baseEsgUrl = () => `${api()}ora_staff_grader/`;

const oraInitializeUrl = () => `${baseEsgUrl()}initialize`;
const fetchSubmissionUrl = () => `${baseEsgUrl()}submission`;
const fetchSubmissionFilesUrl = () => `${baseEsgUrl()}submission/files`;
const fetchSubmissionStatusUrl = () => `${baseEsgUrl()}submission/status`;
const fetchSubmissionLockUrl = () => `${baseEsgUrl()}submission/lock`;
const batchUnlockSubmissionsUrl = () => `${baseEsgUrl()}submission/batch/unlock`;
const updateSubmissionGradeUrl = () => `${baseEsgUrl()}submission/grade`;

const aiGradeSubmissionUrl = () => `${api()}ga-extensions/v1/ai-grader/single-submission/`;
const aiGraderFeedbackUrl = () => `${api()}ga-extensions/v1/ai-grader/feedback/`;
const aiGraderConfigUrl = () => `${api()}ga-extensions/v1/ai-grader/config/`;
const parseSubmissionFileUrl = (oraBlockId, submissionUUID, fileIndex) => (
  `${api()}ga-extensions/v1/ai-grader/ora/${encodeURIComponent(oraBlockId)}/submissions/${encodeURIComponent(submissionUUID)}/files/${fileIndex}/parse`
);
const summarizeSubmissionFileUrl = (oraBlockId, submissionUUID, fileIndex) => (
  `${api()}ga-extensions/v1/ai-grader/ora/${encodeURIComponent(oraBlockId)}/submissions/${encodeURIComponent(submissionUUID)}/files/${fileIndex}/summary`
);

const course = (courseId) => `${baseUrl()}/courses/${courseId}`;

const openResponse = (courseId) => (
  `${course(courseId)}/instructor#view-open_response_assessment`
);
const ora = (courseId, locationId) => `${course(courseId)}/jump_to/${locationId}`;

export default StrictDict({
  api,
  oraInitializeUrl,
  fetchSubmissionUrl,
  fetchSubmissionFilesUrl,
  fetchSubmissionStatusUrl,
  fetchSubmissionLockUrl,
  batchUnlockSubmissionsUrl,
  updateSubmissionGradeUrl,
  aiGradeSubmissionUrl,
  aiGraderFeedbackUrl,
  aiGraderConfigUrl,
  parseSubmissionFileUrl,
  summarizeSubmissionFileUrl,
  baseUrl,
  course,
  openResponse,
  ora,
});
