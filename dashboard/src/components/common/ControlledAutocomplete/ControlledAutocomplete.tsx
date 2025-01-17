import type {
  AutocompleteOption,
  AutocompleteProps,
} from '@/ui/v2/Autocomplete';
import Autocomplete from '@/ui/v2/Autocomplete';
import callAll from '@/utils/callAll';
import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import type { FieldValues, UseControllerProps } from 'react-hook-form';
import { useController, useFormContext } from 'react-hook-form';
import mergeRefs from 'react-merge-refs';

export interface ControlledAutocompleteProps<
  TOption extends AutocompleteOption = AutocompleteOption,
  TFieldValues extends FieldValues = any,
> extends AutocompleteProps<TOption> {
  /**
   * Props passed to the react-hook-form controller.
   */
  controllerProps?: UseControllerProps<TFieldValues>;
  /**
   * Name of the input field.
   */
  name?: string;
  /**
   * Control for the input field.
   */
  control?: UseControllerProps<TFieldValues>['control'];
}

function ControlledAutocomplete(
  {
    controllerProps,
    name,
    control,
    ...props
  }: ControlledAutocompleteProps<AutocompleteOption>,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const { setValue } = useFormContext();
  const { field } = useController({
    ...controllerProps,
    name: controllerProps?.name || name || '',
    control: controllerProps?.control || control,
  });

  return (
    <Autocomplete
      {...props}
      {...field}
      ref={mergeRefs([field.ref, ref])}
      onChange={(event, options, reason, details) => {
        setValue(controllerProps?.name || name, options);

        if (props.onChange) {
          props.onChange(event, options, reason, details);
        }
      }}
      onBlur={callAll(field.onBlur, props.onBlur)}
    />
  );
}

export default forwardRef(ControlledAutocomplete);
