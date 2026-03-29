export function isDiscountAllowed(item) {
	// extend later from backend policy
	if (!item) return false

	// example rule: allow unless explicitly blocked
	return item.allow_discount !== false
}

export function validateDiscount({
	item,
	rate,
	discount_type,
	discount_value,
}) {
	if (!isDiscountAllowed(item)) {
		return {
			ok: false,
			reason: "discount_not_allowed",
			message: "Discount is not allowed for this item",
		}
	}

	let discountAmount = 0

	if (discount_type === "percentage") {
		discountAmount = (rate * discount_value) / 100
	} else if (discount_type === "amount") {
		discountAmount = discount_value
	}

	if (discountAmount > rate) {
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