'use client'

import {Button} from '@/components/catalyst/button'
import {Checkbox, CheckboxField} from '@/components/catalyst/checkbox'
import {Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle} from '@/components/catalyst/dialog'
import {Description, Field, FieldGroup, Label} from '@/components/catalyst/fieldset'
import {Input} from '@/components/catalyst/input'
import {Select} from '@/components/catalyst/select'
import {useState} from 'react'

export default function RefundOrder({amount, ...props}) {
	let [isOpen, setIsOpen] = useState(false)

	return (
		<>
			<Button type="button" onClick={() => setIsOpen(true)} {...props} />
			<Dialog open={isOpen} onClose={setIsOpen}>
				<DialogTitle>Refund payment</DialogTitle>
				<DialogDescription>
					The refund will be reflected in the customer’s bank account 2 to 3 business days after processing.
				</DialogDescription>
				<DialogBody>
					<FieldGroup>
						<Field>
							<Label>Amount</Label>
							<Input name="amount" defaultValue={amount} placeholder="$0.00" autoFocus />
						</Field>
						<Field>
							<Label>Reason</Label>
							<Select name="reason" defaultValue="">
								<option value="" disabled>
									Select a reason&hellip;
								</option>
								<option value="duplicate">Duplicate</option>
								<option value="fraudulent">Fraudulent</option>
								<option value="requested_by_customer">Requested by customer</option>
								<option value="other">Other</option>
							</Select>
						</Field>
						<CheckboxField>
							<Checkbox name="notify" />
							<Label>Notify customer</Label>
							<Description>An email notification will be sent to this customer.</Description>
						</CheckboxField>
					</FieldGroup>
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button onClick={() => setIsOpen(false)}>Refund</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}
