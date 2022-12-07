import ControlledSelect from '@/components/common/ControlledSelect';
import type { RuleGroup } from '@/types/dataBrowser';
import Option from '@/ui/v2/Option';
import Text from '@/ui/v2/Text';
import type { DetailedHTMLProps, HTMLProps } from 'react';
import { useWatch } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

export interface RuleGroupControlsProps
  extends DetailedHTMLProps<HTMLProps<HTMLDivElement>, HTMLDivElement> {
  /**
   * Name of the rule group to control.
   */
  name: string;
  /**
   * Determines whether or not select should be shown or just a label with the
   * operation name.
   */
  showSelect?: boolean;
}

const operationDictionary: Record<RuleGroup['operation'], string> = {
  _and: 'and',
  _or: 'or',
};

export default function RuleGroupControls({
  name,
  showSelect,
  className,
  ...props
}: RuleGroupControlsProps) {
  const currentOperation: RuleGroup['operation'] = useWatch({
    name: `${name}.operation`,
  });

  return (
    <div
      className={twMerge('grid grid-flow-row gap-2 content-start', className)}
      {...props}
    >
      {showSelect ? (
        <ControlledSelect
          name={`${name}.operation`}
          slotProps={{ root: { className: 'bg-white' } }}
          fullWidth
        >
          <Option value="_and">and</Option>
          <Option value="_or">or</Option>
        </ControlledSelect>
      ) : (
        <Text className="p-2 !font-medium">
          {operationDictionary[currentOperation]}
        </Text>
      )}
    </div>
  );
}
