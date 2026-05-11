import React from 'react';
import PropTypes from 'prop-types';

import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';

import FileCard from './FileCard';
import { ErrorBanner, LoadingBanner } from './Banners';
import { renderHooks } from './hooks';

/**
 * <FileRenderer />
 */
export const FileRenderer = ({
  file,
}) => {
  const intl = useIntl();
  const {
    Renderer,
    isLoading,
    errorStatus,
    error,
    rendererProps,
  } = renderHooks({ file, intl });
  return (
    <FileCard key={file.downloadUrl} file={file}>
      {isLoading && file.downloadUrl && <LoadingBanner />}
      {errorStatus ? (
        <ErrorBanner {...error} />
      ) : (
        <>
          {file.downloadUrl && <Renderer {...rendererProps} />}
          {!file.downloadUrl && (
            <Alert variant="danger">
              <FormattedMessage
                defaultMessage="File not found"
                description="File not found error message"
                id="ora-grading.ResponseDisplay.FileRenderer.fileNotFound"
              />
            </Alert>
          )}
        </>
      )}
    </FileCard>
  );
};

FileRenderer.defaultProps = {};
FileRenderer.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string,
    downloadUrl: PropTypes.string,
  }).isRequired,
};

export default FileRenderer;
