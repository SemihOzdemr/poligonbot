import mongoose from 'mongoose';

const InviteSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    uses: { type: Number, required: true },
    inviter: { type: String, required: true},
});

InviteSchema.index({ code: 1 });
InviteSchema.index({ inviter: 1 });


export default mongoose.model('invites', InviteSchema);
