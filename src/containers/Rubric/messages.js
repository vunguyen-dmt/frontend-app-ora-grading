import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  gradeSubmitted: {
    id: 'ora-grading.Rubric.gradeSubmitted',
    defaultMessage: 'Grade Submitted',
    description: 'Submit Grade button text after successful submission',
  },
  rubric: {
    id: 'ora-grading.Rubric.rubric',
    defaultMessage: 'Rubric',
    description: 'Rubric interface label',
  },
  submitGrade: {
    id: 'ora-grading.Rubric.submitGrade',
    defaultMessage: 'Submit grade',
    description: 'Submit Grade button text',
  },
  submittingGrade: {
    id: 'ora-grading.Rubric.submittingGrade',
    defaultMessage: 'Submitting grade',
    description: 'Submit Grade button text while submitting',
  },
  aiGrader: {
    id: 'ora-grading.Rubric.aiGrader',
    defaultMessage: 'AI Access',
    description: 'Button to trigger AI-assisted grading',
  },
  aiGraderPending: {
    id: 'ora-grading.Rubric.aiGraderPending',
    defaultMessage: 'Grading...',
    description: 'AI Access button text while grading is in progress',
  },
  aiGraderComplete: {
    id: 'ora-grading.Rubric.aiGraderComplete',
    defaultMessage: 'Done',
    description: 'AI Access button text after successful grading',
  },
  aiGraderError: {
    id: 'ora-grading.Rubric.aiGraderError',
    defaultMessage: 'AI Access',
    description: 'AI Access button text after an error',
  },
  aiGraderErrorDefault: {
    id: 'ora-grading.Rubric.aiGraderErrorDefault',
    defaultMessage: 'Something went wrong, please try again later.',
    description: 'Default error message when AI grading fails',
  },
  aiGraderExplain: {
    id: 'ora-grading.Rubric.aiGraderExplain',
    defaultMessage: 'Explain',
    description: 'Button to open the AI grading explanation modal',
  },
  aiGraderExplainTitle: {
    id: 'ora-grading.Rubric.aiGraderExplainTitle',
    defaultMessage: 'AI Access Explanation',
    description: 'Title of the AI grading explanation modal',
  },
  aiGraderOverallComment: {
    id: 'ora-grading.Rubric.aiGraderOverallComment',
    defaultMessage: 'Overall',
    description: 'Label for the overall comment in the AI grading explanation',
  },
  aiGraderPromptLabel: {
    id: 'ora-grading.Rubric.aiGraderPromptLabel',
    defaultMessage: 'Prompt',
    description: 'Label for the assignment prompt in the AI grading explanation',
  },
  aiGraderLearnerResponseLabel: {
    id: 'ora-grading.Rubric.aiGraderLearnerResponseLabel',
    defaultMessage: "Learner's Response",
    description: 'Label for the learner response in the AI grading explanation',
  },
  aiGraderAssessmentResultLabel: {
    id: 'ora-grading.Rubric.aiGraderAssessmentResultLabel',
    defaultMessage: 'Assessment Result',
    description: 'Label for the assessment result section in the AI grading explanation',
  },
  aiGraderDisclaimerTitle: {
    id: 'ora-grading.Rubric.aiGraderDisclaimerTitle',
    defaultMessage: 'Towards automatic grading',
    description: 'Title inside the disclaimer box in the AI explanation modal',
  },
  aiGraderExplainDisclaimerLine1: {
    id: 'ora-grading.Rubric.aiGraderExplainDisclaimerLine1',
    defaultMessage: 'AI Access is built to assist, not replace, the course staff; human-in-the-loop is always necessary.',
    description: 'First line of disclaimer warning in the AI grading explanation modal',
  },
  aiGraderExplainDisclaimerLine2: {
    id: 'ora-grading.Rubric.aiGraderExplainDisclaimerLine2',
    defaultMessage: 'The clearer the assignment instructions and grading criteria, the more accurate the AI Access\'s grading results will be.',
    description: 'Second line of disclaimer warning in the AI grading explanation modal',
  },
  aiGraderExplainDisclaimerLine3: {
    id: 'ora-grading.Rubric.aiGraderExplainDisclaimerLine3',
    defaultMessage: 'Avoid adding images, files, links, or complex format to the instruction prompt, it helps the AI Access read your prompt faster and more accurate.',
    description: 'Third line of disclaimer warning in the AI grading explanation modal',
  },
  aiGraderFullPromptLabel: {
    id: 'ora-grading.Rubric.aiGraderFullPromptLabel',
    defaultMessage: 'Full Prompt',
    description: 'Label for the full grading prompt section in the explain modal (superuser only)',
  },
  aiGraderFeedbackButton: {
    id: 'ora-grading.Rubric.aiGraderFeedbackButton',
    defaultMessage: 'Feedback',
    description: 'Button to open feedback modal for AI grading',
  },
  aiGraderFeedbackTitle: {
    id: 'ora-grading.Rubric.aiGraderFeedbackTitle',
    defaultMessage: 'AI Access Feedback',
    description: 'Title of the AI grading feedback modal',
  },
  aiGraderFeedbackPlaceholder: {
    id: 'ora-grading.Rubric.aiGraderFeedbackPlaceholder',
    defaultMessage: 'Tell us how we can improve the AI grading...',
    description: 'Placeholder text for the feedback textarea',
  },
  aiGraderFeedbackSubmit: {
    id: 'ora-grading.Rubric.aiGraderFeedbackSubmit',
    defaultMessage: 'Submit',
    description: 'Submit button in the feedback modal',
  },
  aiGraderFeedbackCancel: {
    id: 'ora-grading.Rubric.aiGraderFeedbackCancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button in the feedback modal',
  },
  aiGraderFeedbackThanks: {
    id: 'ora-grading.Rubric.aiGraderFeedbackThanks',
    defaultMessage: 'Thanks for your feedback!',
    description: 'Message shown after feedback is submitted',
  },
  aiGraderConfigTitle: {
    id: 'ora-grading.Rubric.aiGraderConfigTitle',
    defaultMessage: 'AI Access Configuration',
    description: 'Title of the AI grader config modal',
  },
  aiGraderConfigHelp: {
    id: 'ora-grading.Rubric.aiGraderConfigHelp',
    defaultMessage: 'Enter usernames of learners you have manually graded, separated by commas or newlines. The AI Access will use their graded submissions as examples to calibrate its grading. Leave empty to use the default model.',
    description: 'Help text shown in the AI grader config modal',
  },
  aiGraderConfigPlaceholder: {
    id: 'ora-grading.Rubric.aiGraderConfigPlaceholder',
    defaultMessage: 'username1, username2, username3',
    description: 'Placeholder text for the config usernames textarea',
  },
  aiGraderConfigSave: {
    id: 'ora-grading.Rubric.aiGraderConfigSave',
    defaultMessage: 'Save',
    description: 'Save button in the AI grader config modal',
  },
  aiGraderConfigSaving: {
    id: 'ora-grading.Rubric.aiGraderConfigSaving',
    defaultMessage: 'Saving',
    description: 'Save button pending state in the AI grader config modal',
  },
  aiGraderConfigSaved: {
    id: 'ora-grading.Rubric.aiGraderConfigSaved',
    defaultMessage: 'Saved',
    description: 'Save button complete state in the AI grader config modal',
  },
  aiGraderConfigSaveError: {
    id: 'ora-grading.Rubric.aiGraderConfigSaveError',
    defaultMessage: 'Error',
    description: 'Save button error state in the AI grader config modal',
  },
  aiGraderConfigFewShots: {
    id: 'ora-grading.Rubric.aiGraderConfigFewShots',
    defaultMessage: 'Few Shots',
    description: 'Label for the few-shots section in the AI grader config modal',
  },
  aiGraderConfigCancel: {
    id: 'ora-grading.Rubric.aiGraderConfigCancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button in the AI grader config modal',
  },
  overallComments: {
    id: 'ora-grading.Rubric.overallComments',
    defaultMessage: 'Overall comments',
    description: 'Rubric overall comments label',
  },
  addComments: {
    id: 'ora-grading.Rubric.addComments',
    defaultMessage: 'Add comments (Optional)',
    description: 'Rubric comments input label',
  },
  comments: {
    id: 'ora-grading.Rubric.comments',
    defaultMessage: 'Comments (Optional)',
    description: 'Rubric comments display label',
  },
  overallFeedbackError: {
    id: 'ora-grading.RubricFeedback.error',
    defaultMessage: 'The overall feedback is required',
    description: 'Error message when feedback input is required',
  },
});

export default messages;
