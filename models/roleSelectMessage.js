import mongoose from 'mongoose';

const roleSelectMessage = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
});

roleSelectMessage.index({ id: 1 });


export default mongoose.model('roleSelectMessage', roleSelectMessage);
