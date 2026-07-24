import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { MathJax } from 'better-react-mathjax';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Alert, Button, Card, Icon, Spinner } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';

import createDOMPurify from 'dompurify';

import parse from 'html-react-parser';

import { selectors } from 'data/redux';
import { fileUploadResponseOptions } from 'data/services/lms/constants';
import api from 'data/services/lms/api';
import { locationId } from 'data/constants/app';

import { getConfig } from '@edx/frontend-platform';
import SubmissionFiles from './SubmissionFiles';
import PreviewDisplay from './PreviewDisplay';
import PromptDisplay from './PromptDisplay';
import './ResponseDisplay.scss';

const CHARS_PER_TICK = 4;
const TICK_INTERVAL_MS = 12;

const StreamingMarkdown = ({ content, onComplete }) => {
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    if (!content) return undefined;
    setVisibleLength(0);
    const timer = setInterval(() => {
      setVisibleLength((prev) => {
        let next = prev + CHARS_PER_TICK;
        while (next < content.length && content[next] !== ' ' && content[next] !== '\n') {
          next += 1;
        }
        if (next >= content.length) {
          clearInterval(timer);
          if (onComplete) onComplete();
          return content.length;
        }
        return next;
      });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [content, onComplete]);


  const displayed = content ? content.substring(0, visibleLength) : '';

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {displayed}
    </ReactMarkdown>
  );
};

StreamingMarkdown.propTypes = {
  content: PropTypes.string.isRequired,
  onComplete: PropTypes.func,
};

StreamingMarkdown.defaultProps = {
  onComplete: null,
};

const SubmissionSummaryButton = ({ submissionUUID }) => {
  const [summaryText, setSummaryText] = useState(null);
  const [started, setStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingDone, setStreamingDone] = useState(false);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  const handleSummarize = (event) => {
    event.preventDefault();
    if (isLoading || started) {
      return;
    }
    setStarted(true);
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    api.summarizeSubmission(locationId(), submissionUUID)
      .then((data) => {
        setSummaryText(data?.summary || '');
      })
      .catch((err) => {
        const message = err?.response?.data?.error
          || err?.message
          || 'Failed to summarize submission.';
        setError(message);
        setStarted(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleStreamingComplete = React.useCallback(() => {
    setStreamingDone(true);
  }, []);

  return (
    <div className="mt-3">
      <Button
        variant="outline-primary"
        size="sm"
        style={{ backgroundColor: 'white' }}
        disabled={started}
        onClick={handleSummarize}
      >
        Summarize submission
        {streamingDone && <Icon src={Check} className="ml-1" style={{ color: '#28a745' }} />}
      </Button>

      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      )}

      {started && !error && (
        <div ref={resultRef}>
          <Alert variant="info" className="mt-2">
            This summary is made by AI. Mistakes are possible.
          </Alert>
          <Card className="mt-2">
            <div className="submission-summary-content">
              {isLoading && (
                <div className="d-flex align-items-center">
                  <Spinner animation="border" size="sm" className="mr-2" />
                  Summarizing...
                </div>
              )}
              {summaryText !== null && (
                <StreamingMarkdown
                  content={summaryText}
                  onComplete={handleStreamingComplete}
                />
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

SubmissionSummaryButton.propTypes = {
  submissionUUID: PropTypes.string.isRequired,
};

/**
 * <ResponseDisplay />
 */
export class ResponseDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.purify = createDOMPurify(window);
  }

  get prompts() {
    return this.props.prompts.map((item) => this.formattedHtml(item));
  }

  get textContents() {
    const { text } = this.props.response;
    const formattedText = text.map((item) => this.formattedHtml(item));
    return formattedText;
  }

  get submittedFiles() {
    return this.props.response.files;
  }

  get allowFileUpload() {
    return (
      this.props.fileUploadResponseConfig !== fileUploadResponseOptions.none
    );
  }

  formattedHtml(text) {
    const cleanedText = text.replaceAll(/\.\.\/asset/g, `${getConfig().LMS_BASE_URL}/asset`);
    return parse(this.purify.sanitize(cleanedText));
  }

  render() {
    const { prompts } = this;
    const multiPrompt = prompts.length > 1;
    return (
      <div className="response-display">
        {!multiPrompt && <PromptDisplay prompt={prompts[0]} />}
        {this.allowFileUpload && <SubmissionFiles files={this.submittedFiles} data-testid="submission-files" />}
        {this.allowFileUpload && (
          <PreviewDisplay
            files={this.submittedFiles}
            submissionUUID={this.props.submissionUUID}
            data-testid="allow-file-upload"
          />
        )}
        {
          /*  eslint-disable react/no-array-index-key */
          this.textContents.map((textContent, index) => (
            <MathJax key={index}>
              { multiPrompt && <PromptDisplay prompt={prompts[index]} /> }
              <Card className="response-display-card">
                <Card.Section className="response-display-text-content" data-testid="response-display-text-content">
                  {textContent}
                </Card.Section>
              </Card>
            </MathJax>
          ))
        }
        {this.props.submissionUUID && (
          <SubmissionSummaryButton submissionUUID={this.props.submissionUUID} />
        )}
      </div>
    );
  }
}

ResponseDisplay.defaultProps = {
  response: {
    text: [],
    files: [],
  },
  fileUploadResponseConfig: fileUploadResponseOptions.none,
};

ResponseDisplay.propTypes = {
  response: PropTypes.shape({
    text: PropTypes.arrayOf(PropTypes.string),
    files: PropTypes.arrayOf(
      PropTypes.shape({
        fileName: PropTypes.string,
      }),
    ).isRequired,
  }),
  fileUploadResponseConfig: PropTypes.oneOf(
    Object.values(fileUploadResponseOptions),
  ),
  prompts: PropTypes.arrayOf(PropTypes.string).isRequired,
  submissionUUID: PropTypes.string,
};

export const mapStateToProps = (state) => ({
  response: selectors.grading.selected.response(state),
  fileUploadResponseConfig: selectors.app.ora.fileUploadResponseConfig(state),
  prompts: selectors.app.ora.prompts(state),
  submissionUUID: selectors.grading.selected.submissionUUID(state),
});

export const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ResponseDisplay);
