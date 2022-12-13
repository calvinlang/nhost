import ControlledAutocomplete from '@/components/common/ControlledAutocomplete';
import ControlledSelect from '@/components/common/ControlledSelect';
import ReadOnlyToggle from '@/components/common/ReadOnlyToggle';
import type { PermissionOperator } from '@/types/dataBrowser';
import Input from '@/ui/v2/Input';
import Option from '@/ui/v2/Option';
import { useFormContext, useWatch } from 'react-hook-form';

export interface RuleValueInputProps {
  /**
   * Name of the parent group editor.
   */
  name: string;
}

export default function RuleValueInput({ name }: RuleValueInputProps) {
  const { register } = useFormContext();
  const inputName = `${name}.value`;
  const operator: PermissionOperator = useWatch({ name: `${name}.operator` });

  if (operator === '_in' || operator === '_nin') {
    return (
      <ControlledAutocomplete
        name={inputName}
        multiple
        freeSolo
        className="flex-auto !bg-white"
        slotProps={{ input: { className: 'lg:!rounded-none' } }}
        limitTags={4}
        options={[]}
        fullWidth
      />
    );
  }

  if (operator === '_is_null') {
    return (
      <ControlledSelect
        name={inputName}
        className="flex-auto"
        fullWidth
        slotProps={{ root: { className: 'bg-white lg:!rounded-none h-10' } }}
      >
        <Option value="true">
          <ReadOnlyToggle
            checked
            slotProps={{ label: { className: '!text-sm' } }}
          />
        </Option>

        <Option value="false">
          <ReadOnlyToggle
            checked={false}
            slotProps={{ label: { className: '!text-sm' } }}
          />
        </Option>
      </ControlledSelect>
    );
  }

  return (
    <Input
      {...register(inputName)}
      className="flex-auto"
      slotProps={{
        inputWrapper: { className: '' },
        input: { className: 'lg:!rounded-none h-10 !bg-white' },
      }}
      fullWidth
      autoComplete="off"
    />
  );
}