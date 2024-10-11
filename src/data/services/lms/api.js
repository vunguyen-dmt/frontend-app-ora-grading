import { StrictDict } from 'utils';
import { locationId } from 'data/constants/app';
import { bool } from 'prop-types';
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
 *   oraMetadata: { name, prompt, type ('individual' vs 'team'), rubricConfig, fileUploadResponseConfig },
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
const fetchSubmission = (submissionUUID) => get(
  stringifyUrl(urls.fetchSubmissionUrl(), {
    [paramKeys.oraLocation]: locationId(),
    [paramKeys.submissionUUID]: submissionUUID,
  }),
).then(response => {
  // filter out files that identitcal with other files but don't have download url.
  if (response.data && response.data.response && response.data.response.files
     && response.data.response.files.length > 0) {
    const hasDownloadUrlData = response.data.response.files.filter(f => f.downloadUrl);
    const files = [];
    response.data.response.files.forEach(f1 => {
      let keep = true;
      if (!f1.downloadUrl) {
        hasDownloadUrlData.forEach(f2 => {
          if (f2.name === f1.name && f2.downloadUrl === f1.downloadUrl && f2.size === f1.size) {
            keep = false;
          }
        });
      }

      if (keep) {
        files.push(f1);
      }
    });

    response.data.response.files = files;
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
  // filter out files that identitcal with other files but don't have download url.
  if (response.data && response.data.files
     && response.data.files.length > 0) {
    const hasDownloadUrlData = response.data.files.filter(f => f.downloadUrl);
    const files = [];
    response.data.files.forEach(f1 => {
      let keep = true;
      if (!f1.downloadUrl) {
        hasDownloadUrlData.forEach(f2 => {
          if (f2.name === f1.name && f2.downloadUrl === f1.downloadUrl && f2.size === f1.size) {
            keep = false;
          }
        });
      }

      if (keep) {
        files.push(f1);
      }
    });

    response.data.files = files;
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

export default StrictDict({
  initializeApp,
  fetchSubmission,
  fetchSubmissionFiles,
  fetchSubmissionStatus,
  lockSubmission,
  updateGrade,
  unlockSubmission,
  batchUnlockSubmissions,
});
