// Input.jsx

import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx.js'
import Field from './Field.jsx'
import { CONTROL_CLASSES, describedBy } from './fieldStyles.js'

const Input = forwardRef(({ label, hint, error, className, id: idProp, ...rest }, ref) => {
    const generatedId = useId()
    const id = idProp || generatedId

    return (
        <Field id={id} label={label} hint={hint} error={error} className={className}>
            <input
                ref={ref}
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, hint, error)}
                className={cx(CONTROL_CLASSES, error ? 'border-accent-fg' : 'border-line')}
                {...rest}
            />
        </Field>
    )
})

Input.displayName = 'Input'
export default Input
