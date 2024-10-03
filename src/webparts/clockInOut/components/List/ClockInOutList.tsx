import * as React from 'react';
import { DetailsList, SelectionMode, Label } from '@fluentui/react';
import { IColumn } from '@fluentui/react';
import { IClockInOut } from '../../../../interface';

interface IClockInOutListProps {
  items: IClockInOut[];
  columns: IColumn[];
  onItemInvoked: (item: IClockInOut) => void;
}

const ClockInOutList: React.FC<IClockInOutListProps> = ({ items, columns, onItemInvoked }) => {
  return (
    <>
      {items.length > 0 ? (
        <DetailsList
          items={items}
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
    </>
  );
};

export default ClockInOutList;
