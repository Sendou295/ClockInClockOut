import * as React from 'react';
//import styles from './ClockInOut.module.scss';
import type { IClockInOutProps } from './IClockInOutProps';
import { SPFI } from '@pnp/sp';
import { useEffect, useState } from 'react';
import { IClockInOut } from '../../../interface';
import { getSP } from '../../../pnpjsConfig';
import { DefaultButton, DetailsList,SelectionMode , Dialog, DialogFooter, DialogType, IColumn, Label, PrimaryButton, Stack, StackItem } from '@fluentui/react';
import { format } from 'date-fns';



const ClockInOut = (props: IClockInOutProps) => {
  
  //const LOG_SOURCE = 'ClockInOut Webpart';
  const LIST_NAME = 'Clock-In/Clock-Out';
  let _sp: SPFI = getSP(props.context);

  const [ClockInOutItems, setClockInOutItems] = useState<IClockInOut[]>([])

  const getClockInOutItems = async () => {
    try {
      const items = await _sp.web.lists.getByTitle(LIST_NAME).items();
      setClockInOutItems(
        items.map((items: any) => ({
          ID: items.ID,
          Username: items.Username,
          Email: items.Email,
          ClockInTime: items.ClockInTime, // Ensure this is converted to Date
          ClockOutTime: items.ClockOutTime
        })).sort((a, b) => b.ID - a.ID)
      );
    } catch (error) {
      console.error('Error fetching clock in/out items:', error);
    }
  }
  // State to manage button disabled status
  const [isClockInDisabled, setIsClockInDisabled] = useState(false);
  const [isClockOutDisabled, setIsClockOutDisabled] = useState(true);


  // Function to handle Clock In button click
  const handleClockInClick = async (): Promise<void> => {
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
      await _sp.web.lists.getByTitle(LIST_NAME).items.add({
        Username: newEntry.Username,
        Email: newEntry.Email,
        ClockInTime: currentTime,
        ClockOutTime: currentTime
      });
      await getClockInOutItems();// Refresh the list after adding
    } catch (error) {
      alert('Failed to clock in. Please try again.');
    }
  };

  // Function to handle Clock Out button click
  const handleClockOutClick = async (): Promise<void> => {
    setIsClockInDisabled(false);
    setIsClockOutDisabled(true);
    const currentTime = new Date(); // Get current time as a Date object

    // Find the entry with the highest ID
    const highestIdEntry = ClockInOutItems.reduce((prev, current) => {
      return (prev.ID > current.ID) ? prev : current;
    });
    console.log(highestIdEntry)
    if (highestIdEntry) {
      // Update the ClockOutTime for the entry with the highest ID
      try {
        await _sp.web.lists.getByTitle(LIST_NAME).items.getById(highestIdEntry.ID).update({
          ClockOutTime: currentTime, // Convert to ISO string for SharePoint
        });


        // Reset button states
        await getClockInOutItems(); // Refresh the list after updating


      } catch (error) {
        alert('Failed to clock out.');
      }
    } else {
      alert('No entries found to clock out.');
    }
  };
  const [TimeNow, setTime] = useState(new Date().toLocaleTimeString());
  const getCurrentTime = async (): Promise<void> => {
      setTime(new Date().toLocaleTimeString());
}
 
  useEffect(() => {
    getClockInOutItems();

    const timer = setInterval(() => {
      getCurrentTime();
    }, 1000);
    // Cleanup the interval when the component unmounts
    return () => clearInterval(timer);

  }, [])
  // Function to format the clock in time in the dialog
  const formatClockInTime = (clockInTimeStr: string): string => {
    const clockInTime = new Date(clockInTimeStr);
    if (!isNaN(clockInTime.getTime())) {
      return format(clockInTime, 'dd/MM/yyyy HH:mm:ss');
    } else {
      return clockInTimeStr;
    }
  };
  const formatClockOutTime = (clockOutTimeStr: string): string => {
    const clockOutTime = new Date(clockOutTimeStr);
    if (!isNaN(clockOutTime.getTime())) {
      return format(clockOutTime, 'dd/MM/yyyy HH:mm:ss');
    } else {
      return clockOutTimeStr;
    }
  };
  // Define the columns for the table
  const columns: IColumn[] = [
    { key: 'column1', name: 'ID', fieldName: 'ID', minWidth: 50, maxWidth: 100, isResizable: true },
    { key: 'column2', name: 'Username', fieldName: 'Username', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column3', name: 'Email', fieldName: 'Email', minWidth: 200, maxWidth: 300, isResizable: true },
    { key: 'column4', name: 'Clock In Time', fieldName: 'ClockInTime', minWidth: 150, maxWidth: 250, isResizable: true, 
      onRender: (item) => {
        // Use the formatClockInTime function to format the clock-in time
        return formatClockInTime(item.ClockInTime);
      }
  },
    {
      key: 'column5',
      name: 'Clock Out Time',
      fieldName: 'ClockOutTime',
      minWidth: 150,
      maxWidth: 250,
      isResizable: true,
      onRender: (item) => {
        // Use the formatClockInTime function to format the clock-in time
        return formatClockOutTime(item.ClockOutTime);
      }
    }
  ];


  //Fluent UI Dialog
  const [selectedItem, setSelectedItem] = useState<IClockInOut | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  
  // Function to handle item selection
  const onItemInvoked = (item: IClockInOut): void => {
    setSelectedItem(item);
    setIsDialogVisible(true);
  };
  // Function to close the dialog
  const closeDialog = (): void => {
    setIsDialogVisible(false);
    setSelectedItem(null);
  };


  return (
    <Stack>
      <StackItem>Hello, {[props.userDisplayName]}</StackItem>
      <StackItem>Now is: {[TimeNow]}</StackItem>
      <Dialog
        hidden={!isDialogVisible}
        onDismiss={closeDialog}
        dialogContentProps={{
          type: DialogType.largeHeader,
          title: selectedItem ? selectedItem.Username : '',
          subText: selectedItem ? selectedItem.Email : ''
        }}
      >
          <StackItem>
          <Label>Clock Out Time: {selectedItem ? formatClockInTime(selectedItem.ClockInTime.toString()) : ''}</Label>
          <Label>Clock Out Time: {selectedItem ? formatClockInTime(selectedItem.ClockOutTime.toString()) : ''}</Label>
          </StackItem>
        <DialogFooter>
          <PrimaryButton onClick={closeDialog} text="Close" />
        </DialogFooter>
      </Dialog>
      <StackItem >
        <DefaultButton
          text="Clock In"
          id='btnClockIn'
          onClick={handleClockInClick}
          disabled={isClockInDisabled}  // Controlled by state
        />

        {/* Clock Out Button */}
        <DefaultButton
          text="Clock Out"
          id='btnClockOut'
          onClick={handleClockOutClick}
          disabled={isClockOutDisabled}  // Controlled by state
        />
      </StackItem>
      <StackItem>
        {ClockInOutItems.length > 0 ? (
          <DetailsList
            items={ClockInOutItems}
            columns={columns}
            setKey="set"
            selectionMode={SelectionMode.none}
            layoutMode={0} // Fixed columns layout
            selectionPreservedOnEmptyClick={true}
            ariaLabelForSelectionColumn="Toggle selection"
            checkButtonAriaLabel="select row"
            onItemInvoked={onItemInvoked} // Handle row click
          />
        ) : (
          <Label>No Clock In/Out data available</Label>
        )}
      </StackItem>
    </Stack>
  )
}

export default ClockInOut
