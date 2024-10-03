import * as React from 'react';
import { Dialog, DialogFooter, DialogType, Label, PrimaryButton, Stack, StackItem } from '@fluentui/react';
import { format } from 'date-fns';
import { IClockInOut } from '../../../../interface';

interface IClockInOutDialogProps {
  selectedItem: IClockInOut | null;
  isVisible: boolean;
  closeDialog: () => void;
}

const ClockInOutDialog: React.FC<IClockInOutDialogProps> = ({ selectedItem, isVisible, closeDialog }) => {
  const formatClockTime = (clockTimeStr: string): string => {
    const clockTime = new Date(clockTimeStr);
    return !isNaN(clockTime.getTime()) ? format(clockTime, 'dd/MM/yyyy HH:mm:ss') : clockTimeStr;
  };

  return (
    <Dialog
      hidden={!isVisible}
      onDismiss={closeDialog}
      dialogContentProps={{
        type: DialogType.largeHeader,
        title: selectedItem ? selectedItem.Username : '',
        subText: selectedItem ? selectedItem.Email : ''
      }}
    >
      <Stack>
        <StackItem>
          <Label>Clock In Time: {selectedItem ? formatClockTime(selectedItem.ClockInTime.toString()) : ''}</Label>
          <Label>Clock Out Time: {selectedItem ? formatClockTime(selectedItem.ClockOutTime.toString()) : ''}</Label>
        </StackItem>
      </Stack>
      <DialogFooter>
        <PrimaryButton onClick={closeDialog} text="Close" />
      </DialogFooter>
    </Dialog>
  );
};

export default ClockInOutDialog;