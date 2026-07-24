import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  ActionRow, Alert, Button, Card, Form, Icon, IconButton,
  ModalDialog, StatefulButton,
} from '@openedx/paragon';
import {
  AutoAwesome, Check, CheckCircleOutline, Settings, SpinnerSimple,
  ThumbUp, ThumbUpOutline, ThumbDown, ThumbDownOffAlt,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DemoAlert from 'components/DemoAlert';
import CriterionContainer from 'containers/CriterionContainer';
import { actions, selectors } from 'data/redux';
import { locationId } from 'data/constants/app';
import api from 'data/services/lms/api';
import RubricFeedback from './RubricFeedback';

import * as hooks from './hooks';
import messages from './messages';

import './Rubric.scss';

const { ButtonStates } = hooks;

const doubleNewlines = (text) => {
  if (!text) return '';
  const lines = text.split('\n');
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    result.push(lines[i]);
    const currentIsTable = /^\s*\|/.test(lines[i]);
    const nextIsTable = i + 1 < lines.length && /^\s*[|:-]/.test(lines[i + 1]);
    if (currentIsTable || nextIsTable) {
      result.push('\n');
    } else {
      result.push('\n\n');
    }
  }
  return result.join('');
};

const AIGraderStates = {
  default: 'default',
  pending: 'pending',
  complete: 'complete',
  error: 'error',
};

/**
 * <Rubric />
 */
export const Rubric = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    criteria,
    showFooter,
    buttonProps,
    demoAlertProps,
  } = hooks.rendererHooks({ dispatch });

  const [aiGraderState, setAiGraderState] = React.useState(AIGraderStates.default);
  const [aiGraderError, setAiGraderError] = React.useState(null);
  const [showAiFeedback, setShowAiFeedback] = React.useState(false);
  const [thumbVote, setThumbVote] = React.useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);
  const [feedbackRecordId, setFeedbackRecordId] = React.useState(null);
  const [submittedMessage, setSubmittedMessage] = React.useState(null);
  const [aiGraderResult, setAiGraderResult] = React.useState(null);
  const [explainModalOpen, setExplainModalOpen] = React.useState(false);
  const [configModalOpen, setConfigModalOpen] = React.useState(false);
  const [configUsernames, setConfigUsernames] = React.useState('');
  const [configFewShots, setConfigFewShots] = React.useState(null);
  const [configLoading, setConfigLoading] = React.useState(false);
  const [configSaveState, setConfigSaveState] = React.useState('default');
  const [configError, setConfigError] = React.useState(null);
  const isGrading = useSelector(selectors.grading.selected.isGrading);
  const rubricCriteria = useSelector(selectors.app.rubric.criteria);
  const submissionUUID = useSelector(selectors.grading.selected.submissionUUID);

  const handleAiGrade = async () => {
    setAiGraderState(AIGraderStates.pending);
    setAiGraderError(null);
    setShowAiFeedback(false);
    setThumbVote(null);
    setFeedbackSubmitted(false);
    setFeedbackRecordId(null);
    setSubmittedMessage(null);
    try {
      const result = await api.aiGradeSubmission(locationId(), submissionUUID);

      const criteriaByName = {};
      rubricCriteria.forEach((criterion) => {
        criteriaByName[criterion.label || criterion.name] = criterion.orderNum;
      });

      result.criteria.forEach((criterionResult) => {
        const orderNum = criteriaByName[criterionResult.name];
        if (orderNum === undefined) { return; }
        const criterion = rubricCriteria[orderNum];
        const selectedOption = criterion.options[criterionResult.selectedOption];
        if (selectedOption) {
          dispatch(actions.grading.setCriterionOption({
            orderNum,
            value: selectedOption.name,
          }));
        }
        if (criterionResult.comment) {
          dispatch(actions.grading.setCriterionFeedback({
            orderNum,
            value: criterionResult.comment,
          }));
        }
      });

      if (result.overallComment) {
        dispatch(actions.grading.setRubricFeedback(result.overallComment));
      }

      setAiGraderResult(result);
      setAiGraderState(AIGraderStates.complete);
      setShowAiFeedback(true);
      setTimeout(() => setAiGraderState(AIGraderStates.default), 3000);
    } catch (error) {
      const serverMessage = error?.response?.data?.error;
      setAiGraderError(serverMessage || intl.formatMessage(messages.aiGraderErrorDefault));
      setAiGraderState(AIGraderStates.error);
    }
  };

  const sendFeedback = async (thumb, message) => {
    const oraLocation = locationId();
    if (feedbackRecordId) {
      await api.aiGraderFeedbackUpdate(feedbackRecordId, oraLocation, submissionUUID, thumb, message);
    } else {
      const result = await api.aiGraderFeedback(oraLocation, submissionUUID, thumb, message);
      setFeedbackRecordId(result.id);
    }
  };

  const handleThumbVote = (vote) => {
    setThumbVote(vote);
    sendFeedback(vote, submittedMessage);
  };

  const handleFeedbackSubmit = () => {
    setSubmittedMessage(feedbackText);
    sendFeedback(thumbVote, feedbackText);
    setFeedbackModalOpen(false);
    setFeedbackText('');
    setFeedbackSubmitted(true);
  };

  const handleOpenConfig = async () => {
    setConfigModalOpen(true);
    setConfigLoading(true);
    setConfigError(null);
    try {
      const result = await api.fetchAiGraderConfig(locationId());
      setConfigUsernames(result.usernames || '');
      setConfigFewShots(result.few_shots || null);
    } catch {
      setConfigUsernames('');
      setConfigFewShots(null);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setConfigSaveState('pending');
    setConfigError(null);
    try {
      await api.saveAiGraderConfig(locationId(), configUsernames);
      setConfigSaveState('complete');
      setTimeout(() => {
        setConfigModalOpen(false);
        setConfigSaveState('default');
      }, 1000);
    } catch (error) {
      const serverMessage = error?.response?.data?.error;
      setConfigError(serverMessage || 'Failed to save configuration. Please try again.');
      setConfigSaveState('error');
      setTimeout(() => setConfigSaveState('default'), 3000);
    }
  };

  return (
    <>
      <Card className="grading-rubric-card">
        <Card.Section className="grading-rubric-body">
          <h3 className="mb-0">{intl.formatMessage(messages.rubric)}</h3>
          {isGrading && (
            <div className="ai-grader-group mt-2">
              <div className="d-flex align-items-center">
                <StatefulButton
                  state={aiGraderState}
                  labels={{
                    [AIGraderStates.default]: (
                      <span className="d-flex align-items-center">
                        {intl.formatMessage(messages.aiGrader)}
                        {aiGraderResult && <Icon src={Check} className="ml-1 text-white" style={{ fontSize: '1rem' }} />}
                      </span>
                    ),
                    [AIGraderStates.pending]: intl.formatMessage(messages.aiGraderPending),
                    [AIGraderStates.complete]: intl.formatMessage(messages.aiGraderComplete),
                    [AIGraderStates.error]: intl.formatMessage(messages.aiGraderError),
                  }}
                  icons={{
                    [AIGraderStates.default]: <Icon src={AutoAwesome} />,
                    [AIGraderStates.pending]: <Icon src={SpinnerSimple} className="icon-spin" />,
                    [AIGraderStates.complete]: <Icon src={CheckCircleOutline} />,
                    [AIGraderStates.error]: <Icon src={AutoAwesome} />,
                  }}
                  variant="primary"
                  size="sm"
                  onClick={handleAiGrade}
                  disabledStates={[AIGraderStates.pending]}
                />
                <IconButton
                  src={Settings}
                  iconAs={Icon}
                  alt="AI Access Settings"
                  size="sm"
                  className="ml-1"
                  onClick={handleOpenConfig}
                />
              </div>
              {aiGraderError && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setAiGraderError(null)}
                  className="mt-2"
                >
                  {aiGraderError}
                </Alert>
              )}
              {showAiFeedback && (
                <div className="ai-grader-feedback d-flex align-items-center mt-2">
                  <Button
                    variant="link"
                    size="inline"
                    onClick={() => setExplainModalOpen(true)}
                  >
                    {intl.formatMessage(messages.aiGraderExplain)}
                  </Button>
                  <IconButton
                    src={thumbVote === 'up' ? ThumbUp : ThumbUpOutline}
                    iconAs={Icon}
                    alt="Thumbs up"
                    size="inline"
                    className={`ai-grader-thumb ${thumbVote === 'up' ? 'ai-grader-thumb-active' : ''}`}
                    onClick={() => handleThumbVote('up')}
                  />
                  <IconButton
                    src={thumbVote === 'down' ? ThumbDown : ThumbDownOffAlt}
                    iconAs={Icon}
                    alt="Thumbs down"
                    size="inline"
                    className={`ai-grader-thumb ${thumbVote === 'down' ? 'ai-grader-thumb-active' : ''}`}
                    onClick={() => handleThumbVote('down')}
                  />
                  {feedbackSubmitted ? (
                    <small className="text-muted ml-2">{intl.formatMessage(messages.aiGraderFeedbackThanks)}</small>
                  ) : (
                    <Button
                      variant="link"
                      size="inline"
                      className="ml-2"
                      onClick={() => setFeedbackModalOpen(true)}
                    >
                      {intl.formatMessage(messages.aiGraderFeedbackButton)}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
          <hr className="m-2.5" />
          {criteria.map(props => <CriterionContainer {...props} />)}
          <hr />
          <RubricFeedback />
        </Card.Section>
        {showFooter && (
          <div className="grading-rubric-footer">
            <StatefulButton
              {...buttonProps}
              labels={{
                [ButtonStates.default]: intl.formatMessage(messages.submitGrade),
                [ButtonStates.pending]: intl.formatMessage(messages.submittingGrade),
                [ButtonStates.complete]: intl.formatMessage(messages.gradeSubmitted),
              }}
            />
          </div>
        )}
      </Card>
      <ModalDialog
        title={intl.formatMessage(messages.aiGraderFeedbackTitle)}
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        hasCloseButton
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {intl.formatMessage(messages.aiGraderFeedbackTitle)}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <Form.Control
            as="textarea"
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={intl.formatMessage(messages.aiGraderFeedbackPlaceholder)}
          />
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              {intl.formatMessage(messages.aiGraderFeedbackCancel)}
            </ModalDialog.CloseButton>
            <Button
              variant="primary"
              onClick={handleFeedbackSubmit}
              disabled={!feedbackText.trim()}
            >
              {intl.formatMessage(messages.aiGraderFeedbackSubmit)}
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
      <ModalDialog
        title={intl.formatMessage(messages.aiGraderExplainTitle)}
        isOpen={explainModalOpen}
        onClose={() => setExplainModalOpen(false)}
        hasCloseButton
        size="lg"
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {intl.formatMessage(messages.aiGraderExplainTitle)}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          {aiGraderResult && (
            <div className="ai-grader-explain-content">
              <strong>{intl.formatMessage(messages.aiGraderPromptLabel)}</strong>
              <div className="text-muted">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{doubleNewlines(aiGraderResult.oraPrompt)}</ReactMarkdown>
              </div>

              <hr />
              <strong>{intl.formatMessage(messages.aiGraderLearnerResponseLabel)}</strong>
              <div className="text-muted">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{doubleNewlines(aiGraderResult.learnerResponse)}</ReactMarkdown>
              </div>

              <hr />
              <strong>{intl.formatMessage(messages.aiGraderAssessmentResultLabel)}</strong>
              {aiGraderResult.criteria.map((criterion) => (
                <div key={criterion.name} className="ai-grader-explain-criterion">
                  <strong>{criterion.name} - {criterion.points}/{criterion.maxPoints}</strong>
                  <div className="text-muted">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{doubleNewlines(criterion.comment)}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {aiGraderResult.overallComment && (
                <>
                  <hr />
                  <strong>
                    {intl.formatMessage(messages.aiGraderOverallComment)}
                    {' - '}
                    {aiGraderResult.criteria.reduce((sum, c) => sum + (c.points || 0), 0)}
                    /
                    {aiGraderResult.criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0)}
                  </strong>
                  <div className="text-muted">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{doubleNewlines(aiGraderResult.overallComment)}</ReactMarkdown>
                  </div>
                </>
              )}
              {aiGraderResult.gradingPrompt && (
                <>
                  <hr />
                  <strong>{intl.formatMessage(messages.aiGraderFullPromptLabel)}</strong>
                  <div className="border rounded p-3 mt-1 bg-light-200" style={{ maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                    <small className="text-muted">{aiGraderResult.gradingPrompt}</small>
                  </div>
                </>
              )}
            </div>
          )}
          <Alert variant="warning" className="mt-3">
            <Alert.Heading>{intl.formatMessage(messages.aiGraderDisclaimerTitle)}</Alert.Heading>
            <div>{intl.formatMessage(messages.aiGraderExplainDisclaimerLine1)}</div>
            <div>{intl.formatMessage(messages.aiGraderExplainDisclaimerLine2)}</div>
            <div>{intl.formatMessage(messages.aiGraderExplainDisclaimerLine3)}</div>
          </Alert>
        </ModalDialog.Body>
      </ModalDialog>
      <ModalDialog
        title={intl.formatMessage(messages.aiGraderConfigTitle)}
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        hasCloseButton
        size="lg"
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {intl.formatMessage(messages.aiGraderConfigTitle)}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p className="text-muted small mb-3">
            {intl.formatMessage(messages.aiGraderConfigHelp)}
          </p>
          {configError && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setConfigError(null)}
              className="mb-3"
            >
              {configError}
            </Alert>
          )}
          {configLoading ? (
            <div className="d-flex justify-content-center p-4">
              <Icon src={SpinnerSimple} className="icon-spin" />
            </div>
          ) : (
            <>
              <Form.Control
                as="textarea"
                rows={5}
                value={configUsernames}
                onChange={(e) => setConfigUsernames(e.target.value)}
                placeholder={intl.formatMessage(messages.aiGraderConfigPlaceholder)}
              />
              {configFewShots && (
                <div className="mt-3">
                  <strong>{intl.formatMessage(messages.aiGraderConfigFewShots)}</strong>
                  <div className="border rounded p-3 mt-1 bg-light-200" style={{ maxHeight: '300px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                    <small className="text-muted">{configFewShots}</small>
                  </div>
                </div>
              )}
            </>
          )}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              {intl.formatMessage(messages.aiGraderConfigCancel)}
            </ModalDialog.CloseButton>
            <StatefulButton
              state={configSaveState}
              labels={{
                default: intl.formatMessage(messages.aiGraderConfigSave),
                pending: intl.formatMessage(messages.aiGraderConfigSaving),
                complete: intl.formatMessage(messages.aiGraderConfigSaved),
                error: intl.formatMessage(messages.aiGraderConfigSaveError),
              }}
              variant="primary"
              onClick={handleSaveConfig}
              disabledStates={['pending', 'complete']}
              disabled={configLoading}
            />
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
      <DemoAlert {...demoAlertProps} />
    </>
  );
};

export default Rubric;
