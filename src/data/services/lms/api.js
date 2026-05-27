import { StrictDict } from 'utils';
import { locationId } from 'data/constants/app';
import { paramKeys } from './constants';
import urls from './urls';
import {
  client,
  get,
  post,
  stringifyUrl,
} from './utils';

/*********************************************************************************
 * GET Actions
 *********************************************************************************/

/**
 * get('/api/initialize', { oraLocation })
 * @return {
 *   oraMetadata: { name, prompts, type ('individual' vs 'team'), rubricConfig, fileUploadResponseConfig },
 *   courseMetadata: { courseOrg, courseName, courseNumber, courseId },
 *   submissions: {
 *     [submissionUUID]: {
 *       id: <submissionUUID>, (not currently used)
 *       username
 *       submissionUUID
 *       dateSubmitted (timestamp)
 *       gradeStatus (['ungraded', 'graded', 'locked', 'locked_by_you'?])
 *       grade: { pointsEarned, pointsPossible }
 *     },
 *     ...
 *   },
 * }
 */
const initializeApp = () => get(
  stringifyUrl(urls.oraInitializeUrl(), {
    [paramKeys.oraLocation]: locationId(),
  }),
).then(response => response.data);

/**
 * get('/api/submission', { oraLocation, submissionUUID })
 * @return {
 *   submission: {
 *     gradeData,
 *     gradeStatus,
 *     response: { files: [{}], text: <html> },
 *   },
 * }
 */
const filterDuplicateFiles = (files) => files.filter(f => f.downloadUrl);

const fetchSubmission = (submissionUUID) => get(
  stringifyUrl(urls.fetchSubmissionUrl(), {
    [paramKeys.oraLocation]: locationId(),
    [paramKeys.submissionUUID]: submissionUUID,
  }),
).then(response => {
  if (response.data?.response?.files?.length > 0) {
    response.data.response.files = filterDuplicateFiles(response.data.response.files);
  }
  return response.data;
});

/**
 * get('/api/submission/files', { oraLocation, submissionUUID })
 * @return {
 *     response: { files: [{}], text: <html> },
 * }
 */
const fetchSubmissionFiles = (submissionUUID) => get(
  stringifyUrl(urls.fetchSubmissionFilesUrl(), {
    [paramKeys.oraLocation]: locationId(),
    [paramKeys.submissionUUID]: submissionUUID,
  }),
).then(response => {
  if (response.data?.files?.length > 0) {
    response.data.files = filterDuplicateFiles(response.data.files);
  }
  return response.data;
});

/**
 * fetches the current grade, gradeStatus, and rubricResponse data for the given submission
 * get('/api/submissionStatus', { oraLocation, submissionUUID })
 *   @return {obj} submissionStatus object
 *   {
 *     gradeData,
 *     gradeStatus,
 *     lockStatus,
 *   }
 */
const fetchSubmissionStatus = (submissionUUID) => get(
  stringifyUrl(urls.fetchSubmissionStatusUrl(), {
    [paramKeys.oraLocation]: locationId(),
    [paramKeys.submissionUUID]: submissionUUID,
  }),
).then(response => response.data);

/**
 * post('api/lock', { oraLocation, submissionUUID });
 * @param {string} submissionUUID
 */
const lockSubmission = (submissionUUID) => post(
  stringifyUrl(urls.fetchSubmissionLockUrl(), {
    [paramKeys.oraLocation]: locationId(),
    [paramKeys.submissionUUID]: submissionUUID,
  }),
).then(response => response.data);

/**
 * unlockSubmission(submissionUUID)
 * @param {string} submissionUUID
 */
const unlockSubmission = (submissionUUID) => client().delete(
  stringifyUrl(urls.fetchSubmissionLockUrl(), {
    [paramKeys.oraLocation]: locationId(),
    [paramKeys.submissionUUID]: submissionUUID,
  }),
).then(response => response.data);

/**
 * batchUnlockSubmissions(submissionUUIDs)
 * @param {string[]} submissionUUIDs - list of submission uuids
 */
const batchUnlockSubmissions = (submissionUUIDs) => post(
  stringifyUrl(
    urls.batchUnlockSubmissionsUrl(),
    { [paramKeys.oraLocation]: locationId() },
  ),
  { submissionUUIDs },
).then(response => response.data);

/*
 * post('api/updateGrade', { submissionUUID, gradeData })
 * @param {object} gradeData - full grading submission data
 */
const updateGrade = (submissionUUID, gradeData) => post(
  stringifyUrl(urls.updateSubmissionGradeUrl(), {
    [paramKeys.oraLocation]: locationId(),
    [paramKeys.submissionUUID]: submissionUUID,
  }),
  gradeData,
).then(response => response.data);

const aiGradeSubmission = (oraLocation, submissionUUID) => post(
  urls.aiGradeSubmissionUrl(),
  { oraLocation, submissionUUID },
).then(response => response.data);

const aiGraderFeedback = (oraLocation, submissionUUID, thumb, message) => post(
  urls.aiGraderFeedbackUrl(),
  {
    feedback: {
      ora_location: oraLocation,
      submission_uuid: submissionUUID,
      grader_mode: 'single-submission',
      message: message || null,
      thumb: thumb || null,
    },
  },
).then(response => response.data);

const parseSubmissionFile = (oraBlockId, submissionUUID, fileIndex) => get(
  urls.parseSubmissionFileUrl(oraBlockId, submissionUUID, fileIndex),
).then(response => response.data);

const summarizeSubmissionFile = (oraBlockId, submissionUUID, fileIndex) => get(
  urls.summarizeSubmissionFileUrl(oraBlockId, submissionUUID, fileIndex),
).then(response => response.data);

const fetchAiGraderConfig = (oraLocation) => get(
  stringifyUrl(urls.aiGraderConfigUrl(), { oraLocation }),
).then(response => response.data);

const saveAiGraderConfig = (oraLocation, usernames) => post(
  urls.aiGraderConfigUrl(),
  { oraLocation, usernames },
).then(response => response.data);

const aiGraderFeedbackUpdate = (feedbackId, oraLocation, submissionUUID, thumb, message) => client().put(
  urls.aiGraderFeedbackUrl(),
  {
    id: feedbackId,
    feedback: {
      ora_location: oraLocation,
      submission_uuid: submissionUUID,
      grader_mode: 'single-submission',
      message: message || null,
      thumb: thumb || null,
    },
  },
).then(response => response.data);

export default StrictDict({
  initializeApp,
  fetchSubmission,
  fetchSubmissionFiles,
  fetchSubmissionStatus,
  lockSubmission,
  updateGrade,
  unlockSubmission,
  batchUnlockSubmissions,
  aiGradeSubmission,
  aiGraderFeedback,
  aiGraderFeedbackUpdate,
  fetchAiGraderConfig,
  saveAiGraderConfig,
  parseSubmissionFile,
  summarizeSubmissionFile,
});
