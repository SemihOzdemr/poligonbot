import mongoose from 'mongoose';

const tickets = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user: {type: String, required: true},
    active: {type: Boolean, required: true},
    closeUser: {type: String}
});

tickets.index({ id: 1 });


export default mongoose.model('tickets', tickets);
