
const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	contactEmail: {
		type: String,
		trim: true
	},
	phone: {
		type: String,
		trim: true
	},
	address: {
		type: String,
		trim: true
	},
	notes: {
		type: String,
		trim: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Supplier', SupplierSchema);
