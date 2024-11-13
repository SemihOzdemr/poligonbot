import mongoose from 'mongoose';

const ticketMessage = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
});

ticketMessage.index({ id: 1 });


export default mongoose.model('ticketMessage', ticketMessage);
