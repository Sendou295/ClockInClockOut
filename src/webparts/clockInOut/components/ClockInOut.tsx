import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack, StackItem } from '@fluentui/react';
import { SPFI } from '@pnp/sp';
import { IClockInOutProps } from './IClockInOutProps';
import { IClockInOut } from '../../../interface';
import ClockInOutList from './List/ClockInOutList';
import ClockInOutDialog from './List/ClockInOutDialog';
import ClockInOutButtons from './List/ClockInOutButtons';
import { getSP } from '../../../pnpjsConfig';
import { IColumn } from '@fluentui/react';

const ClockInOut: React.FC<IClockInOutProps> = (props) => {
  const LIST_NAME = 'Clock-In/Clock-Out';
  let _sp: SPFI = getSP(props.context);

  const [ClockInOutItems, setClockInOutItems] = useState<IClockInOut[]>([]);
  const [TimeNow, setTime] = useState(new Date().toLocaleTimeString());
  const [isClockInDisabled, setIsClockInDisabled] = useState(false);
  const [isClockOutDisabled, setIsClockOutDisabled] = useState(true);
  const [selectedItem, setSelectedItem] = useState<IClockInOut | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const getClockInOutItems = async () => {
    try {
      const items = await _sp.web.lists.getByTitle(LIST_NAME).items();
      setClockInOutItems(items.map((item: any) => ({
        ID: item.ID,
        Username: item.Username,
        Email: item.Email,
        ClockInTime: item.ClockInTime,
        ClockOutTime: item.ClockOutTime
      })).sort((a, b) => b.ID - a.ID));
    } catch (error) {
      console.error('Error fetching clock in/out items:', error);
    }
  };

  const handleClockInClick = async () => {
    setIsClockInDisabled(true);
    setIsClockOutDisabled(false);
    const currentTime = new Date();
    const newEntry: IClockInOut = {
      ID: 0,
      Username: props.userDisplayName,
      Email: props.userDisplayEmail.toString(),
      ClockInTime: currentTime,
      ClockOutTime: currentTime
    };

    try {
      await _sp.web.lists.getByTitle(LIST_NAME).items.add(newEntry);
      await getClockInOutItems();
    } catch (error) {
      alert('Failed to clock in. Please try again.');
    }
  };

  const handleClockOutClick = async () => {
    setIsClockInDisabled(false);
    setIsClockOutDisabled(true);
    const currentTime = new Date();

    const highestIdEntry = ClockInOutItems.reduce((prev, current) => (prev.ID > current.ID) ? prev : current);
    if (highestIdEntry) {
      try {
        await _sp.web.lists.getByTitle(LIST_NAME).items.getById(highestIdEntry.ID).update({
          ClockOutTime: currentTime
        });
        await getClockInOutItems();
      } catch (error) {
        alert('Failed to clock out.');
      }
    } else {
      alert('No entries found to clock out.');
    }
  };

  const onItemInvoked = (item: IClockInOut): void => {
    setSelectedItem(item);
    setIsDialogVisible(true);
  };

  const closeDialog = (): void => {
    setIsDialogVisible(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    getClockInOutItems();
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const columns: IColumn[] = [
    { key: 'column1', name: 'ID', fieldName: 'ID', minWidth: 50, maxWidth: 100, isResizable: true },
    { key: 'column2', name: 'Username', fieldName: 'Username', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column3', name: 'Email', fieldName: 'Email', minWidth: 200, maxWidth: 300, isResizable: true },
    { key: 'column4', name: 'Clock In Time', fieldName: 'ClockInTime', minWidth: 150, maxWidth: 250, isResizable: true,
      onRender: (item) => new Date(item.ClockInTime).toLocaleString() },
    { key: 'column5', name: 'Clock Out Time', fieldName: 'ClockOutTime', minWidth: 150, maxWidth: 250, isResizable: true,
      onRender: (item) => new Date(item.ClockOutTime).toLocaleString() }
  ];

  return (
    <Stack>
      <StackItem>Hello, {props.userDisplayName}</StackItem>
      <StackItem>Now is: {TimeNow}</StackItem>

      <ClockInOutButtons
        handleClockInClick={handleClockInClick}
        handleClockOutClick={handleClockOutClick}
        isClockInDisabled={isClockInDisabled}
        isClockOutDisabled={isClockOutDisabled}
      />

      <ClockInOutList
        items={ClockInOutItems}
        columns={columns}
        onItemInvoked={onItemInvoked}
      />

      <ClockInOutDialog
        selectedItem={selectedItem}
        isVisible={isDialogVisible}
        closeDialog={closeDialog}
      />
    </Stack>
  );
};

export default ClockInOut;