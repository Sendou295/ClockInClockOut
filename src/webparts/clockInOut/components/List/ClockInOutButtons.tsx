import * as React from 'react';
import { DefaultButton } from '@fluentui/react';

interface IClockInOutButtonsProps {
  handleClockInClick: () => void;
  handleClockOutClick: () => void;
  isClockInDisabled: boolean;
  isClockOutDisabled: boolean;
}

const ClockInOutButtons: React.FC<IClockInOutButtonsProps> = ({
  handleClockInClick,
  handleClockOutClick,
  isClockInDisabled,
  isClockOutDisabled
}) => {
  return (
    <>
      <DefaultButton
        text="Clock In"
        id='btnClockIn'
        onClick={handleClockInClick}
        disabled={isClockInDisabled}  // Controlled by state
      />
      <DefaultButton
        text="Clock Out"
        id='btnClockOut'
        onClick={handleClockOutClick}
        disabled={isClockOutDisabled}  // Controlled by state
      />
    </>
  );
};

export default ClockInOutButtons;