function isExplicitTrue(value) {
	return value === true || value === 1 || value === "1" || value === "true"
}

function isExplicitFalse(value) {
	return value === false || value === 0 || value === "0" || value === "false"
}

export function isDiscountAllowed(item) {
	if (!item) return false

	const candidates = [
		item.allow_discount,
		item.is_discount_allowed,
		item.custom_allow_discount,
	]

	for (const value of candidates) {
		if (isExplicitFalse(value)) return false
		if (isExplicitTrue(value)) return true
	}

	// Default to allowed when the item has no explicit discount flag.
	return true
}

export function validateDiscount({
	item,
	rate,
	discount_type,
	discount_value,
}) {
	const numericRate = Number(rate || 0)
	const numericDiscountValue = Number(discount_value || 0)

	if (!isDiscountAllowed(item)) {
		const hasRequestedDiscount = numericDiscountValue > 0
		if (hasRequestedDiscount) {
			return {
				ok: false,
				reason: "discount_not_allowed",
				message: "Discount is not allowed for this item",
			}
		}

		return {
			ok: true,
			discount_amount: 0,
		}
	}

	let discountAmount = 0

	if (discount_type === "percentage") {
		discountAmount = (numericRate * numericDiscountValue) / 100
	} else if (discount_type === "amount") {
		discountAmount = numericDiscountValue
	}

	if (discountAmount > numericRate) {
		return {
			ok: false,
			reason: "discount_exceeds_rate",
			message: "Discount cannot exceed item rate",
		}
	}

	return {
		ok: true,
		discount_amount: discountAmount,
	}
}
