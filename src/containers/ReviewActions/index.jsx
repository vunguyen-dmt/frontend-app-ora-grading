import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ActionRow, Button } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { actions, selectors } from 'data/redux';
import { RequestKeys } from 'data/constants/requests';

import StatusBadge from 'components/StatusBadge';
import StartGradingButton from './components/StartGradingButton';
import SubmissionNavigation from './components/SubmissionNavigation';
import messages from './messages';

import './ReviewActions.scss';

export const ReviewActions = ({
  gradingStatus,
  toggleShowRubric,
  score: { pointsEarned, pointsPossible },
  showRubric,
  userDisplay,
  fullname,
  isLoaded,
}) => (
  <div>
    <ActionRow className="review-actions">
      <span className="review-actions-username">
        <div className="user-info-display">
          <div>
            <span className="lead">{fullname}</span>{ gradingStatus && (<StatusBadge className="review-actions-status mr-3" status={gradingStatus} />)}
          </div>
          <div>{userDisplay}</div>
        </div>
        <span className="small">
          {pointsPossible && (
            <FormattedMessage
              {...messages.pointsDisplay}
              values={{ pointsEarned, pointsPossible }}
            />
          )}
        </span>
      </span>
      <div className="review-actions-group">
        {isLoaded && (
          <>
            <Button variant="outline-primary mr-2" onClick={toggleShowRubric}>
              <FormattedMessage {...(showRubric ? messages.hideRubric : messages.showRubric)} />
            </Button>
            <StartGradingButton />
          </>
        )}
        <SubmissionNavigation />
      </div>
    </ActionRow>
  </div>
);
ReviewActions.defaultProps = {
  isLoaded: false,
  gradingStatus: null,
  fullname: '',
};
ReviewActions.propTypes = {
  gradingStatus: PropTypes.string,
  userDisplay: PropTypes.string.isRequired,
  score: PropTypes.shape({
    pointsEarned: PropTypes.number,
    pointsPossible: PropTypes.number,
  }).isRequired,
  showRubric: PropTypes.bool.isRequired,
  toggleShowRubric: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool,
  fullname: PropTypes.string,
};

export const mapStateToProps = (state) => ({
  userDisplay: selectors.grading.selected.userDisplay(state),
  gradingStatus: selectors.grading.selected.gradingStatus(state),
  score: selectors.grading.selected.score(state),
  showRubric: selectors.app.showRubric(state),
  isLoaded: selectors.requests.isCompleted(state, { requestKey: RequestKeys.fetchSubmission }),
  fullname: selectors.grading.selected.fullname(state),
});

export const mapDispatchToProps = {
  toggleShowRubric: actions.app.toggleShowRubric,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReviewActions);
