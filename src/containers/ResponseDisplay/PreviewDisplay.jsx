import React from 'react';
import PropTypes from 'prop-types';

import { FileRenderer } from 'components/FilePreview';
import { isSupported } from 'components/FilePreview/hooks';

/**
 * <PreviewDisplay />
 */
export const PreviewDisplay = ({ files, submissionUUID }) => (
  <div className="preview-display">
    {files.map((file, index) => ({ file, originalIndex: index }))
      .filter(({ file }) => isSupported(file))
      .map(({ file, originalIndex }) => (
        <FileRenderer
          key={file.name}
          file={file}
          fileIndex={originalIndex}
          submissionUUID={submissionUUID}
        />
      ))}
  </div>
);

PreviewDisplay.defaultProps = {
  files: [],
  submissionUUID: '',
};
PreviewDisplay.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      downloadUrl: PropTypes.string,
    }),
  ),
  submissionUUID: PropTypes.string,
};

export default PreviewDisplay;
