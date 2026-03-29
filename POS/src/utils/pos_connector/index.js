import uomPolicyAdapter from "./uomPolicyAdapter"
import { shouldValidateItemStock, checkStockAvailability } from "./stockValidator"
import { getStockHint } from "./stockHint"
import { validateDiscount } from "./discountPolicy"
import { buildLine } from "./lineBuilder"

class PosConnector {
	async prepareCartLine({
		item,
		qty = 1,
		uom = null,
		rate = 0,
		discount = {},
		warehouse = null,
	}) {
		// 1. ensure policy loaded
		await uomPolicyAdapter.ensurePolicyLoaded(item)

		// 2. normalize item
		item = uomPolicyAdapter.normalizeItem(item)

		// 3. apply UOM safely
		if (uom) {
			const result = uomPolicyAdapter.applySelectedUom(item, uom)
			if (!result.ok) {
				return {
					ok: false,
					reason: result.reason,
					message: "UOM not allowed",
					item: result.item,
				}
			}
			item = result.item
		}

		// 4. stock validation
		let stockResult = {
			available: true,
			actualQty: 0,
			hint: "",
		}

		if (shouldValidateItemStock(item)) {
			const conversion = item.conversion_factor || 1
			const requiredQty = qty * conversion

			const stockCheck = checkStockAvailability(item, requiredQty, warehouse)

			stockResult = {
				...stockCheck,
				required_qty: requiredQty,
				hint: getStockHint(item, stockCheck),
			}

			if (!stockCheck.available) {
				return {
					ok: false,
					reason: "out_of_stock",
					message: stockCheck.error,
					stock: stockResult,
				}
			}
		}

		// 5. discount validation
		const discountResult = validateDiscount({
			item,
			rate,
			discount_type: discount?.type,
			discount_value: discount?.value || 0,
		})

		if (!discountResult.ok) {
			return discountResult
		}

		// 6. build final line
		return buildLine({
			item,
			qty,
			uom: item.uom,
			conversion_factor: item.conversion_factor,
			rate,
			discount_amount: discountResult.discount_amount,
			stockResult,
		})
	}
}

export const posConnector = new PosConnector()
export default posConnector