import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Alert, Button, Card, Spinner } from '@openedx/paragon';

import api from 'data/services/lms/api';
import { locationId } from 'data/constants/app';

import './ExtractTextButton.scss';

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

const ExtractTextButton = ({ submissionUUID, fileIndex }) => {
  const [extractedText, setExtractedText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [summaryText, setSummaryText] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const handleExtract = () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setError(null);

    api.parseSubmissionFile(locationId(), submissionUUID, fileIndex)
      .then((data) => {
        setExtractedText(data?.content || '');
      })
      .catch((err) => {
        const message = err?.response?.data?.error
          || err?.message
          || 'Failed to extract text from file.';
        setError(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSummarize = () => {
    if (isSummarizing) {
      return;
    }
    setIsSummarizing(true);
    setSummaryError(null);

    api.summarizeSubmissionFile(locationId(), submissionUUID, fileIndex)
      .then((data) => {
        setSummaryText(data?.summary || '');
      })
      .catch((err) => {
        const message = err?.response?.data?.error
          || err?.message
          || 'Failed to summarize file.';
        setSummaryError(message);
      })
      .finally(() => {
        setIsSummarizing(false);
      });
  };

  return (
    <div className="mt-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={handleExtract}
      >
        {isLoading ? (
          <>
            <Spinner animation="border" size="sm" className="mr-2" />
            Extracting...
          </>
        ) : 'Extract text'}
      </Button>

      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      )}

      {extractedText !== null && !error && (
        <>
          <Alert variant="warning" className="mt-2">
            Optical character recognition (OCR) technology is not perfect; please use it with caution.
          </Alert>
          <Card className="mt-2">
            <Card.Section className="extracted-text-content">
              {extractedText ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {doubleNewlines(extractedText)}
                </ReactMarkdown>
              ) : '(No text content extracted)'}
            </Card.Section>
          </Card>

          <Button
            variant="outline-primary"
            size="sm"
            className="mt-2"
            onClick={handleSummarize}
          >
            {isSummarizing ? (
              <>
                <Spinner animation="border" size="sm" className="mr-2" />
                Summarizing...
              </>
            ) : 'Summary'}
          </Button>
        </>
      )}

      {summaryError && (
        <Alert variant="danger" className="mt-2">
          {summaryError}
        </Alert>
      )}

      {summaryText !== null && !summaryError && (
        <>
          <Alert variant="info" className="mt-2">
            This summary is made by a Large Language Model (LLM).
          </Alert>
          <Card className="mt-2">
          <Card.Section className="extracted-text-content">
            {summaryText ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {doubleNewlines(summaryText)}
              </ReactMarkdown>
            ) : '(No summary available)'}
          </Card.Section>
        </Card>
        </>
      )}
    </div>
  );
};

ExtractTextButton.propTypes = {
  submissionUUID: PropTypes.string.isRequired,
  fileIndex: PropTypes.number.isRequired,
};

export default ExtractTextButton;
